-- ============================================================================
-- SISTRA-TEC | Row Level Security (RLS) + Triggers de soporte
-- Proyecto Supabase: SISTRA-TEC (Postgres 17)
-- ----------------------------------------------------------------------------
-- OBJETIVO
--   Activar RLS en las 4 tablas de public y definir politicas por rol
--   (admin / donor / transporter) sin romper los flujos actuales del frontend.
--
-- CONTEXTO DE ACCESO (confirmado leyendo el codigo del front + pg_proc):
--   - profiles:   AuthContext/LoginPage -> SELECT id,role WHERE id=auth.uid()
--                 AdminUsers.js          -> SELECT * (admin) + UPDATE role (admin)
--                 EditUserPage           -> UPDATE propio (datos, NO role)
--                 RegisterPage           -> hoy hace INSERT directo (DEBE migrar a trigger)
--   - donations:  escrituras via RPC SECURITY DEFINER (AddDonation, ConfirmDelivery).
--                 lectura directa solo GetDonationDashboard (SECURITY INVOKER -> respeta RLS).
--   - beneficiaries:        leida por el LEFT JOIN de GetDonationDashboard (invoker).
--   - delivery_confirmations: insert via RPC ConfirmDelivery (definer).
--
-- VERIFICACION DE FUNCIONES (pg_proc):
--   AddDonation               -> SECURITY DEFINER  (bypassa RLS)  [no necesita politica de write]
--   ConfirmDelivery           -> SECURITY DEFINER  (bypassa RLS)
--   GetTransportistaDashboard -> SECURITY DEFINER  (bypassa RLS)
--   GetDonationDashboard      -> SECURITY INVOKER  (RESPETA RLS)  -> SI necesita politicas SELECT
--
-- BEST PRACTICES APLICADAS (Supabase RLS performance & security):
--   1) auth.uid() e is_admin() envueltos en (select ...) -> el optimizador hace
--      un initPlan y CACHEA el resultado por statement en vez de evaluarlo por fila.
--   2) Toda politica declara `TO authenticated` -> descarta al rol anon sin gastar
--      ciclos evaluando la expresion (y deja anon sin acceso por defecto).
--   3) is_admin() es SECURITY DEFINER -> lee profiles bypassando RLS, evitando la
--      RECURSION infinita que ocurriria si una politica de profiles consultara profiles.
--   4) Nombres totalmente calificados (public.*) + SET search_path para robustez.
--
-- IDEMPOTENTE: usa CREATE OR REPLACE / DROP ... IF EXISTS, se puede correr varias veces.
-- NO destructivo de datos. NO aplicar a ciegas en prod sin correr el plan de verificacion.
-- ============================================================================


-- ============================================================================
-- 1) FUNCION HELPER: public.is_admin()
-- ----------------------------------------------------------------------------
-- Devuelve TRUE si el usuario autenticado actual tiene role='admin'.
-- SECURITY DEFINER: corre con los privilegios del owner (postgres), por lo que
-- la lectura interna de profiles BYPASSA RLS. Esto es lo que rompe el ciclo de
-- recursion: si la politica SELECT de profiles llamara a una funcion que lee
-- profiles RESPETANDO RLS, se invocaria la propia politica una y otra vez.
-- STABLE: el resultado no cambia dentro de un mismo statement -> habilita cacheo.
-- SET search_path=public: evita secuestro de search_path (seguridad en DEFINER).
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Los roles del cliente deben poder EJECUTAR la funcion para que las politicas
-- que la referencian se evaluen sin error de permisos.
--   - authenticated: la usa en casi todas las politicas.
--   - anon: la incluimos para que, si una request anon golpea una politica que
--     referencia is_admin(), devuelva false en vez de error de permiso.
grant execute on function public.is_admin() to authenticated, anon;


-- ============================================================================
-- 2) TRIGGER handle_new_user(): crea el profile al registrarse
-- ----------------------------------------------------------------------------
-- POR QUE UN TRIGGER Y NO UN INSERT DESDE EL FRONT:
--   La confirmacion de email esta ACTIVA (el login maneja "Email not confirmed").
--   Tras supabase.auth.signUp() NO hay sesion -> auth.uid() es NULL -> un INSERT
--   directo en profiles con RLS activa NO tiene politica que lo permita y FALLA.
--   Por eso el perfil se crea del lado del servidor con un trigger AFTER INSERT
--   sobre auth.users, ejecutado como SECURITY DEFINER (bypassa RLS).
--
-- METADATA QUE ESPERA (raw_user_meta_data, set desde signUp options.data):
--   - first_name (text)   [requerido: la columna es NOT NULL]
--   - last_name  (text)   [requerido: la columna es NOT NULL]
--   - phone      (text)   [opcional: la columna es nullable]
--   username = new.email  (NOT NULL, siempre presente).
--   role     = 'donor'    SIEMPRE, sin importar la metadata (anti escalada: nadie
--                         se auto-asigna admin/transporter en el registro).
--
-- COALESCE('') en first/last_name: red de seguridad para que un signUp sin esa
-- metadata no rompa por la restriccion NOT NULL. Aun asi, RegisterPage DEBE
-- enviar los valores reales (ver seccion "PARA EL FRONTEND" al final).
-- ON CONFLICT (id) DO NOTHING: idempotencia si el profile ya existiera.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, first_name, last_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name',  ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'donor'   -- forzado por seguridad
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================================
-- 3) TRIGGER anti-escalada de privilegios en profiles
-- ----------------------------------------------------------------------------
-- Impide que un usuario NO admin cambie su PROPIO role (o el de cualquiera).
-- La politica UPDATE deja que un usuario edite su propia fila (nombre, telefono,
-- etc.), pero NO debe permitirle subir su role a 'admin'/'transporter'. Como RLS
-- (WITH CHECK) no puede comparar facilmente NEW.role vs OLD.role, lo hacemos con
-- un trigger BEFORE UPDATE a nivel de fila.
--
-- Logica: si el role CAMBIA y quien ejecuta NO es admin -> excepcion.
-- is_admin() lee auth.uid() desde los claims del JWT (GUC de la request), por lo
-- que funciona correctamente aunque sea invocado dentro del trigger.
-- ============================================================================
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'No autorizado: solo un administrador puede cambiar el rol (role) de un usuario.'
      using errcode = '42501';  -- insufficient_privilege
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on public.profiles;
create trigger trg_prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_change();


-- ============================================================================
-- 4) HABILITAR ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Con RLS activa y sin politica que aplique, el acceso queda DENEGADO por
-- defecto (para anon/authenticated). Las funciones SECURITY DEFINER (RPCs y los
-- triggers de arriba) siguen funcionando porque su owner bypassa RLS.
-- NO usamos FORCE ROW LEVEL SECURITY: queremos que el owner (DEFINER) siga
-- pudiendo escribir sin politicas.
-- ============================================================================
alter table public.profiles                enable row level security;
alter table public.donations               enable row level security;
alter table public.beneficiaries           enable row level security;
alter table public.delivery_confirmations  enable row level security;


-- ============================================================================
-- 5) POLITICAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 profiles
--   SELECT: el propio usuario ve su fila; el admin ve todas (panel AdminUsers).
--   UPDATE: el propio usuario edita su fila; el admin edita cualquiera.
--           (el cambio de role lo blinda el trigger prevent_role_change).
--   INSERT: NO se define politica para el cliente. El alta la hace el trigger
--           handle_new_user (DEFINER). Un INSERT directo desde el front quedara
--           BLOQUEADO a proposito (por eso RegisterPage debe migrar al trigger).
--   DELETE: sin politica -> nadie borra profiles desde el cliente (los borra el
--           cascade de auth.users o un admin via service_role).
-- ----------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or (select public.is_admin())
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update
  on public.profiles
  for update
  to authenticated
  using (
    (select auth.uid()) = id
    or (select public.is_admin())
  )
  with check (
    (select auth.uid()) = id
    or (select public.is_admin())
  );


-- ----------------------------------------------------------------------------
-- 5.2 donations
--   SELECT: el donante ve sus donaciones (donor_id), el transportista ve las que
--           tiene asignadas (transported_by), y el admin ve todas.
--           -> habilita GetDonationDashboard (invoker, filtra donor_id) y una
--              eventual vista admin directa sobre donations.
--   WRITES: el flujo real entra por RPC SECURITY DEFINER (AddDonation /
--           ConfirmDelivery actualiza status), que bypassa RLS -> no requieren
--           politica. Se agregan politicas de write SOLO para admin, por si se
--           necesita corregir datos manualmente desde un panel autenticado.
-- ----------------------------------------------------------------------------
drop policy if exists donations_select on public.donations;
create policy donations_select
  on public.donations
  for select
  to authenticated
  using (
    donor_id = (select auth.uid())
    or transported_by = (select auth.uid())
    or (select public.is_admin())
  );

-- Writes opcionales solo-admin (los RPC DEFINER no dependen de esto):
drop policy if exists donations_insert_admin on public.donations;
create policy donations_insert_admin
  on public.donations
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists donations_update_admin on public.donations;
create policy donations_update_admin
  on public.donations
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists donations_delete_admin on public.donations;
create policy donations_delete_admin
  on public.donations
  for delete
  to authenticated
  using ((select public.is_admin()));


-- ----------------------------------------------------------------------------
-- 5.3 beneficiaries
--   SELECT: cualquier usuario AUTENTICADO puede leer. Necesario porque
--           GetDonationDashboard (invoker) hace LEFT JOIN beneficiaries; ese join
--           se ejecuta con la RLS del usuario que llama. Tambien lo usa el panel
--           admin y el formulario de registro de donaciones.
--           Implementado como `TO authenticated USING (true)`, equivalente a
--           `auth.role() = 'authenticated'` pero mas performante (sin evaluar una
--           expresion por fila) y dejando fuera a anon.
--   WRITES: solo admin (alta/edicion/baja de instituciones beneficiarias).
-- ----------------------------------------------------------------------------
drop policy if exists beneficiaries_select on public.beneficiaries;
create policy beneficiaries_select
  on public.beneficiaries
  for select
  to authenticated
  using (true);

drop policy if exists beneficiaries_insert_admin on public.beneficiaries;
create policy beneficiaries_insert_admin
  on public.beneficiaries
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists beneficiaries_update_admin on public.beneficiaries;
create policy beneficiaries_update_admin
  on public.beneficiaries
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists beneficiaries_delete_admin on public.beneficiaries;
create policy beneficiaries_delete_admin
  on public.beneficiaries
  for delete
  to authenticated
  using ((select public.is_admin()));


-- ----------------------------------------------------------------------------
-- 5.4 delivery_confirmations
--   SELECT: el transportista que confirmo la entrega (confirmed_by) ve su
--           registro; el admin ve todos.
--   INSERT: el alta entra por RPC ConfirmDelivery (DEFINER) -> bypassa RLS, no
--           requiere politica. Se agrega write solo-admin para correcciones.
-- ----------------------------------------------------------------------------
drop policy if exists delivery_confirmations_select on public.delivery_confirmations;
create policy delivery_confirmations_select
  on public.delivery_confirmations
  for select
  to authenticated
  using (
    confirmed_by = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists delivery_confirmations_write_admin on public.delivery_confirmations;
create policy delivery_confirmations_write_admin
  on public.delivery_confirmations
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));


-- ============================================================================
-- 6) GRANTS
-- ----------------------------------------------------------------------------
-- En Supabase, anon/authenticated ya tienen los GRANTs de tabla por defecto
-- (el acceso real lo gobierna RLS). Lo critico es el EXECUTE de is_admin(), que
-- ya se otorgo en la seccion 1. Si tu setup hubiera revocado los grants base,
-- descomenta lo siguiente:
--
-- grant usage on schema public to authenticated, anon;
-- grant select, insert, update, delete on public.profiles               to authenticated;
-- grant select, insert, update, delete on public.donations              to authenticated;
-- grant select, insert, update, delete on public.beneficiaries          to authenticated;
-- grant select, insert, update, delete on public.delivery_confirmations to authenticated;
-- ============================================================================


-- ============================================================================
-- PARA EL FRONTEND (cambio REQUERIDO en RegisterPage.jsx)
-- ----------------------------------------------------------------------------
-- Con RLS activa y SIN politica INSERT en profiles, el INSERT directo actual de
-- RegisterPage FALLARA (ademas no hay sesion por la confirmacion de email).
-- Reemplazar el signUp + insert por un unico signUp que pase la metadata; el
-- trigger handle_new_user crea el profile:
--
--   await supabase.auth.signUp({
--     email: correo,
--     password: contrasena,
--     options: {
--       data: {
--         first_name: nombre,
--         last_name:  apellido,
--         phone:      telefono,
--       },
--     },
--   });
--   // <- ELIMINAR el supabase.from('profiles').insert({...}) posterior.
-- ============================================================================


-- ############################################################################
-- ############################################################################
-- ROLLBACK (revertir rapido) -- DEJAR COMENTADO. Descomentar solo si hay que
-- volver al estado previo (RLS desactivada y sin objetos creados aqui).
-- ADVERTENCIA: con RLS desactivada las tablas vuelven a quedar TOTALMENTE
-- EXPUESTAS al rol anon/authenticated (el problema de seguridad original).
-- ----------------------------------------------------------------------------
--
-- -- 1) Quitar politicas
-- drop policy if exists profiles_select                     on public.profiles;
-- drop policy if exists profiles_update                     on public.profiles;
-- drop policy if exists donations_select                    on public.donations;
-- drop policy if exists donations_insert_admin              on public.donations;
-- drop policy if exists donations_update_admin              on public.donations;
-- drop policy if exists donations_delete_admin              on public.donations;
-- drop policy if exists beneficiaries_select                on public.beneficiaries;
-- drop policy if exists beneficiaries_insert_admin          on public.beneficiaries;
-- drop policy if exists beneficiaries_update_admin          on public.beneficiaries;
-- drop policy if exists beneficiaries_delete_admin          on public.beneficiaries;
-- drop policy if exists delivery_confirmations_select       on public.delivery_confirmations;
-- drop policy if exists delivery_confirmations_write_admin  on public.delivery_confirmations;
--
-- -- 2) Desactivar RLS
-- alter table public.profiles               disable row level security;
-- alter table public.donations              disable row level security;
-- alter table public.beneficiaries          disable row level security;
-- alter table public.delivery_confirmations disable row level security;
--
-- -- 3) Quitar triggers y funciones
-- drop trigger   if exists trg_prevent_role_change on public.profiles;
-- drop trigger   if exists on_auth_user_created    on auth.users;
-- drop function  if exists public.prevent_role_change();
-- drop function  if exists public.handle_new_user();
-- drop function  if exists public.is_admin();
--
-- ############################################################################
-- ############################################################################
