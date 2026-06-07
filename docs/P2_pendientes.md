# SISTRA-TEC — Pendientes según el enunciado (Proyecto 2)

> Documento de seguimiento. Compara lo que pide `docs/P2_requerimientos.md`
> contra el estado actual del proyecto. Actualizado: 2026-06-07.
>
> Leyenda: `[x]` hecho — `[~]` parcial / en progreso — `[ ]` pendiente.

## 1. Requerimientos técnicos (sección 2 del enunciado)

- [x] **Frontend**: React + estado global (Context API: `AuthContext`) + consumo de APIs async (Supabase).
- [~] **Backend en capas / Clean Architecture (Node/Python/.NET)**: el proyecto usa
  **Supabase (BaaS)** con funciones **RPC** en Postgres (`AddDonation`, `ConfirmDelivery`,
  `GetDonationDashboard`, `GetTransportistaDashboard`). No hay un backend propio en capas.
  Es defendible como MVA con BaaS, pero el enunciado pide backend en capas explícitamente.
  **Acción: confirmar con el profesor si el enfoque BaaS es aceptable o documentar la
  arquitectura por capas equivalente (UI / RPC-API / DB).**
- [x] **Base de datos**: PostgreSQL (Supabase, Postgres 17).
- [x] **Autenticación JWT + roles**: Supabase Auth (JWT). Roles diferenciados
  `admin` / `donor` / `transporter`. (OAuth social no implementado; solo email+password.)

## 2. Fases del ejercicio

### Fase A — Modelado y Contratos
- [ ] **4 Historias de Usuario** adicionales a "Registro de Donación", en el formato pedido.
  (No existe documentación de HU en `docs/`.)

### Fase B — Desarrollo del Core
- [~] **Lógica de estados** `Recibido -> Clasificado -> En Tránsito -> Entregado`:
  - [x] Creación en estado `Recibido` (`AddDonation`).
  - [ ] Transición a `Clasificado` (no implementada).
  - [ ] Transición a `En Tránsito` al asignar transportista: `AssignDonationPage` **no
    persiste** el cambio en Supabase (el panel admin de donaciones usa datos mock).
  - [ ] Entrega: hay **bug**, ver sección 5.
- [ ] **Frontend inclusivo (GenderMag + WCAG)** en formularios. No aplicado (ver sección 3).

### Fase C — Despliegue y Calidad
- [ ] **Muro de Género**: identificar y documentar al menos uno.
- [ ] **Pruebas unitarias** (cobertura mínima 70% de la lógica). No existe ningún test propio.
- [ ] **Despliegue** con Docker o nube (Heroku/AWS/Azure). No hay `Dockerfile` ni config de deploy.

## 3. Inclusión cognitiva (GenderMag) — checklist del enunciado

- [ ] **Mensajes de error constructivos**: hoy se usan `alert()` crudos y se expone
  `error.message` del servidor. Cambiar a mensajes claros y tranquilizadores en pantalla.
- [ ] **Botón "Deshacer" (Undo) visible** en acciones reversibles.
- [ ] **Explicar el "por qué"** antes de pedir cada dato en los formularios.
- [ ] **Ayuda en contexto** (notas junto a campos difíciles), sin mandar a manuales externos.

## 4. Métrica de producción (rúbrica)

- [~] **Arquitectura**: Frontend separado de DB; "API" es BaaS + RPC (no backend propio en capas).
- [~] **Seguridad**: contraseñas hasheadas por Supabase (ok). Rutas protegidas + RLS:
  **en progreso** (validación de rol en `App.jsx` + `supabase/rls_policies.sql`).
- [~] **UX/Inclusión**: responsive parcial; lenguaje inclusivo y GenderMag sin auditar.

## 5. Bugs / deuda técnica detectados (revisión 2026-06-07)

- [ ] **`ConfirmDelivery` usa `status = 'Entregada'`** pero el CHECK constraint solo acepta
  `'Entregado'` -> la confirmación de entrega fallaría. Alinear a `'Entregado'`.
- [ ] **RLS deshabilitado** en las 4 tablas (en remediación con `rls_policies.sql`).
- [ ] **Autorización por `localStorage`** sin validar rol (en remediación con la guardia de `App.jsx`).
- [ ] **Bug de storage** en `RegisterDonationPage`: sube a `donation_images` pero pide URL de `evidencias`.
- [ ] **Servicios admin en mock**: `AdminDonations.js` (donaciones) y `AdminBeneficiaries.js`
  (beneficiarios) siguen en localStorage; falta migrarlos a Supabase.
- [ ] Regex de email con `$$` repetido (Login/Register/EditUser); centralizar en `validators.js`.

## 6. Prioridades sugeridas

1. **Inclusión / GenderMag** (eje central del enunciado y de bajo costo): mensajes
   constructivos, ayuda en contexto, explicar el "por qué", botón deshacer.
2. **Pruebas (70%)** y **despliegue (Docker/nube)** — ítems explícitos de Fase C, hoy en cero.
3. **Flujo de estados completo** + arreglar el bug `Entregada`/`Entregado` + conectar el
   panel admin de donaciones/beneficiarios a Supabase.
4. **Documentación**: 4 Historias de Usuario + Muro de Género.
5. **Backend**: aclarar con el profesor el enfoque BaaS vs. capas.

## 7. Hecho en esta iteración (referencia)

- [x] Consolidación de ramas en `main` y limpieza del repo.
- [x] AuthProvider activo; reset de contraseña por correo (PASSWORD_RECOVERY).
- [x] Roles con UI en español / valores internos en inglés; panel de usuarios sobre Supabase.
- [x] Eliminación de IDs de usuario hardcodeados (uso de `useAuth`).
- [~] RLS + políticas y validación de rol en `App.jsx` (por aplicar a la DB).
