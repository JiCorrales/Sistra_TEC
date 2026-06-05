import { useState } from "react";
import {
  SectionHeader, Table, TR, TD,
  Input, Select, Btn, PageWrapper, Footer, BackBtn,
} from "../components/UI";
import { mockUsers } from "../data/mockData";
import { teal, tealLight, tealDark } from "../tokens";

/**
 * AdminUsuariosPage
 * Rendered as a tab inside AdminDashboardPage — no Navbar/Footer of its own.
 */
export default function AdminUsuariosPage() {
  const [editUser, setEditUser] = useState(null);

  if (editUser) {
    return <EditUserPage user={editUser} onBack={() => setEditUser(null)} />;
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SectionHeader title="Todos los Usuarios" />
        <div style={{ display: "flex", gap: 12 }}>
          <Input placeholder="Nombre de usuario" />
          <Btn size="sm">Buscar</Btn>
        </div>
      </div>

      <Table
        columns={["Usuario", "ID", "Rol", ""]}
        rows={mockUsers}
        renderRow={(u, i) => (
          <TR key={i} hover>
            <TD>{u.usuario}</TD>
            <TD><span style={{ fontSize: 12, color: "#94a3b8" }}>{u.id}</span></TD>
            <TD><RolBadge rol={u.rol} /></TD>
            <TD>
              <Btn size="sm" variant="ghost" onClick={() => setEditUser(u)}>
                Editar
              </Btn>
            </TD>
          </TR>
        )}
      />
    </div>
  );
}

// ─── ROL BADGE ────────────────────────────────────────────────────────────────
function RolBadge({ rol }) {
  const styles = {
    Administrador: { background: "#ede9fe", color: "#7c3aed" },
    Donador:       { background: tealLight, color: tealDark },
    Transportista: { background: "#fff7ed", color: "#c2410c" },
  };
  const s = styles[rol] || { background: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ ...s, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {rol}
    </span>
  );
}

// ─── EDIT USER SUB-PAGE ───────────────────────────────────────────────────────
function EditUserPage({ user, onBack }) {
  return (
    <PageWrapper>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <SectionHeader title={`Editar usuario: ${user.usuario}`} />
        <div style={{
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          padding: 32, maxWidth: 500, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Nombre de usuario:" value={user.usuario} />
            <Input label="Cédula:"            placeholder="0-00000000" />
            <Input label="Nombre:"            placeholder="Por favor, introduzca su nombre." />
            <Input label="Apellido:"          placeholder="Por favor, introduzca su apellido." />
            <Input label="Correo:"            placeholder="Por favor, introduzca su correo." />
            <Input label="Teléfono:"          placeholder="0000-0000" />
            <Select
              label="Rol:"
              placeholder="Seleccionar rol"
              options={["Administrador", "Donador", "Transportista"]}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <BackBtn onClick={onBack} />
              <Btn onClick={onBack} style={{ flex: 1 }}>
                Guardar cambios
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
