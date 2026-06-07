-- ============================================================================
-- RPC: GetAllDonations
-- Vista de ADMINISTRADOR: devuelve TODAS las donaciones del sistema (de todos
-- los donadores), con el mismo formato de columnas que ya consume el frontend.
--
-- Es el equivalente "sin filtro de usuario" de tu función GetDonationDashboard,
-- más el nombre del donante (que el admin sí necesita ver).
--
-- CÓMO USARLO:
--   1. Abrí el SQL Editor de tu proyecto en Supabase.
--   2. Revisá los comentarios "-- AJUSTAR": están donde el nombre de la tabla o
--      columna NO se puede confirmar desde el código del front, solo inferir.
--      Si tu esquema usa otros nombres, cambialos acá.
--   3. Ejecutá el script. Probalo con:  select * from "GetAllDonations"();
--   4. En src/services/AdminDonations.js, descomentá el bloque "MODO REAL".
--
-- SUPUESTOS (inferidos de AddDonation.js, DonadorDashboardPage.js y
-- RegisterDonationPage.jsx). *(por confirmar contra tu esquema real)*:
--   - Tabla de donaciones:   public.donations
--   - Tabla de beneficiarios: public.beneficiaries (id, name)   [confirmado]
--   - Tabla de donadores:     public.users (id uuid, full_name) [por confirmar]
-- ============================================================================

create or replace function public."GetAllDonations"()
returns table (
  id              text,   -- código de seguimiento (tracking id)
  tipo            text,   -- tipo de donación
  beneficiario    text,   -- nombre de la institución beneficiaria
  estado          text,   -- estado actual
  donante         text,   -- nombre del donador
  fecha           date,   -- fecha de registro
  description     text,   -- descripción del envío
  donor_image_url text    -- evidencia fotográfica (URL pública)
)
language sql
security definer
set search_path = public
as $$
  select
    d.tracking_id::text          as id,             -- AJUSTAR: columna PK/seguimiento
    d.donation_type              as tipo,           -- AJUSTAR: columna tipo
    b.name                       as beneficiario,
    d.status                     as estado,         -- AJUSTAR: columna estado
    coalesce(u.full_name, '—')   as donante,        -- AJUSTAR: tabla/columna del donador
    d.created_at::date           as fecha,          -- AJUSTAR: columna fecha de creación
    d.description                as description,
    d.donor_image_url            as donor_image_url
  from public.donations d                            -- AJUSTAR: tabla de donaciones
  left join public.beneficiaries b on b.id = d.beneficiary_id
  left join public.users u         on u.id = d.donor_id   -- AJUSTAR: tabla del donador
  order by d.created_at desc;
$$;

-- Permisos: que el rol autenticado (y/o anon, según tu setup) pueda invocarla.
grant execute on function public."GetAllDonations"() to authenticated;
-- grant execute on function public."GetAllDonations"() to anon;  -- descomentar si aplica

-- ----------------------------------------------------------------------------
-- NOTA: cuando conectés esto, lo ideal es restringir la ejecución a usuarios
-- con rol admin (vía RLS o un check de rol dentro de la función). Por ahora la
-- función es de solo lectura y replica el comportamiento de GetDonationDashboard.
-- ----------------------------------------------------------------------------
