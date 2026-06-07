import { useEffect, useMemo, useState } from "react";
import {
  SectionHeader, Table, TR, TD,
  Input, Select, Btn, BackBtn,
} from "../components/UI";
import {
  getAdminUsers,
  updateAdminUserAccess,
} from "../services/AdminUsers";
import { ROLE_OPTIONS_ES, roleLabel, roleValue } from "../utils/roles";
import { tealLight, tealDark } from "../tokens";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    const loadedUsers = await getAdminUsers();
    setUsers(loadedUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm, roleFilter),
    [users, searchTerm, roleFilter]
  );

  const saveUserAccess = async (userId, accessData) => {
    await updateAdminUserAccess(userId, accessData);
    await loadUsers();
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <UserAccessForm
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onSave={saveUserAccess}
      />
    );
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <SectionHeader title="Todos los Usuarios" />

      <div style={styles.filterRow}>
        <Input
          placeholder="Buscar por usuario, nombre o correo"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Select
          placeholder="Rol"
          options={ROLE_OPTIONS_ES}
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        />
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            setRoleFilter("");
          }}
        >
          Limpiar
        </Btn>
      </div>

      <Table
        columns={["Usuario", "Nombre", "Correo", "Telefono", "Rol", "Acciones"]}
        rows={filteredUsers}
        renderRow={(user) => (
          <TR key={user.id} hover>
            <TD>
              <strong>{user.usuario}</strong>
              <div style={styles.secondaryText}>{user.id}</div>
            </TD>
            <TD>
              {user.nombre} {user.apellido}
            </TD>
            <TD>{user.correo}</TD>
            <TD>{user.telefono}</TD>
            <TD><RoleBadge role={user.rol} /></TD>
            <TD>
              <div style={styles.actionRow}>
                <Btn size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                  Acceso
                </Btn>
              </div>
            </TD>
          </TR>
        )}
      />
    </div>
  );
}

function UserAccessForm({ user, onBack, onSave }) {
  // El select trabaja con la etiqueta en español; al guardar se convierte
  // al valor interno (inglés) con roleValue antes de tocar la base de datos.
  const [role, setRole] = useState(roleLabel(user.rol));

  const submitUserAccess = () => {
    if (!role) {
      alert("Seleccione un rol para el usuario.");
      return;
    }

    // Persona 2 only manages admin access; personal profile editing stays out of scope.
    onSave(user.id, { rol: roleValue(role) });
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      <SectionHeader title={`Administrar acceso: ${user.usuario}`} />
      <div style={styles.formCard}>
        <div style={styles.readOnlyGrid}>
          <ReadOnlyField label="Nombre completo" value={`${user.nombre} ${user.apellido}`} />
          <ReadOnlyField label="Correo" value={user.correo} />
          <ReadOnlyField label="Telefono" value={user.telefono} />
        </div>

        <div style={styles.accessGrid}>
          <Select
            label="Rol:"
            options={ROLE_OPTIONS_ES}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
        </div>

        <div style={styles.formActions}>
          <BackBtn onClick={onBack} />
          <Btn onClick={submitUserAccess} style={{ flex: 1 }}>
            Guardar acceso
          </Btn>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div style={styles.readOnlyLabel}>{label}</div>
      <div style={styles.readOnlyValue}>{value}</div>
    </div>
  );
}

function filterUsers(users, searchTerm, roleFilter) {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  return users.filter((user) => {
    const searchableText = normalizeSearchText([
      user.usuario,
      user.nombre,
      user.apellido,
      user.correo,
      user.telefono,
    ].join(" "));

    const matchesSearch = normalizedSearchTerm
      ? searchableText.includes(normalizedSearchTerm)
      : true;
    // El usuario guarda el rol en inglés; el filtro muestra etiquetas en español,
    // así que comparamos traduciendo el valor interno a su etiqueta.
    const matchesRole = roleFilter ? roleLabel(user.rol) === roleFilter : true;

    return matchesSearch && matchesRole;
  });
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().trim();
}

function RoleBadge({ role }) {
  // role llega en su valor interno (inglés); se traduce a español para mostrar.
  const label = roleLabel(role);
  const stylesByRole = {
    Administrador: { background: "#ede9fe", color: "#7c3aed" },
    Donador: { background: tealLight, color: tealDark },
    Transportista: { background: "#fff7ed", color: "#c2410c" },
  };
  const badgeStyle = stylesByRole[label] || { background: "#f1f5f9", color: "#475569" };

  return (
    <span style={{ ...badgeStyle, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {label}
    </span>
  );
}

const styles = {
  filterRow: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 180px auto",
    gap: 12,
    alignItems: "end",
    marginBottom: 20,
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  secondaryText: {
    marginTop: 4,
    fontSize: 12,
    color: "#94a3b8",
  },
  formCard: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    padding: 32,
    maxWidth: 700,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  readOnlyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 20,
  },
  accessGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  readOnlyLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: 600,
    marginBottom: 4,
  },
  readOnlyValue: {
    border: "1.5px solid #e2e8f0",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#1e293b",
    background: "#f1f5f9",
    fontSize: 14,
  },
  formActions: {
    display: "flex",
    gap: 12,
    marginTop: 24,
    alignItems: "center",
  },
};
