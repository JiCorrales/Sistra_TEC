import { useEffect, useMemo, useState } from "react";
import {
  SectionHeader, Table, TR, TD,
  Input, Select, Btn, BackBtn,
} from "../components/UI";
import {
  getAdminUsers,
  toggleAdminUserStatus,
  updateAdminUserAccess,
} from "../services/AdminUsers";
import { tealLight, tealDark } from "../tokens";

const ROLE_OPTIONS = ["Administrador", "Donador", "Transportista"];
const USER_STATUS_OPTIONS = ["Activo", "Inactivo"];

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    const loadedUsers = await getAdminUsers();
    setUsers(loadedUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm, roleFilter, statusFilter),
    [users, searchTerm, roleFilter, statusFilter]
  );

  const saveUserAccess = async (userId, accessData) => {
    await updateAdminUserAccess(userId, accessData);
    await loadUsers();
    setSelectedUser(null);
  };

  const changeUserStatus = async (userId) => {
    const updatedUsers = await toggleAdminUserStatus(userId);
    setUsers(updatedUsers);
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
          placeholder="Buscar por usuario, nombre, correo o cedula"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Select
          placeholder="Rol"
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        />
        <Select
          placeholder="Estado"
          options={USER_STATUS_OPTIONS}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        />
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            setRoleFilter("");
            setStatusFilter("");
          }}
        >
          Limpiar
        </Btn>
      </div>

      <Table
        columns={["Usuario", "Nombre", "Correo", "Telefono", "Rol", "Estado", "Acciones"]}
        rows={filteredUsers}
        renderRow={(user) => (
          <TR key={user.id} hover>
            <TD>
              <strong>{user.usuario}</strong>
              <div style={styles.secondaryText}>{user.id}</div>
            </TD>
            <TD>
              {user.nombre} {user.apellido}
              <div style={styles.secondaryText}>{user.cedula}</div>
            </TD>
            <TD>{user.correo}</TD>
            <TD>{user.telefono}</TD>
            <TD><RoleBadge role={user.rol} /></TD>
            <TD><StatusBadge status={user.estado} /></TD>
            <TD>
              <div style={styles.actionRow}>
                <Btn size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                  Acceso
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => changeUserStatus(user.id)}>
                  {user.estado === "Activo" ? "Desactivar" : "Activar"}
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
  const [role, setRole] = useState(user.rol);
  const [status, setStatus] = useState(user.estado);

  const submitUserAccess = () => {
    if (!role) {
      alert("Seleccione un rol para el usuario.");
      return;
    }

    // Persona 2 only manages admin access; personal profile editing stays out of scope.
    onSave(user.id, { rol: role, estado: status });
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      <SectionHeader title={`Administrar acceso: ${user.usuario}`} />
      <div style={styles.formCard}>
        <div style={styles.readOnlyGrid}>
          <ReadOnlyField label="Nombre completo" value={`${user.nombre} ${user.apellido}`} />
          <ReadOnlyField label="Cedula" value={user.cedula} />
          <ReadOnlyField label="Correo" value={user.correo} />
          <ReadOnlyField label="Telefono" value={user.telefono} />
        </div>

        <div style={styles.accessGrid}>
          <Select
            label="Rol:"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
          <Select
            label="Estado:"
            options={USER_STATUS_OPTIONS}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
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

function filterUsers(users, searchTerm, roleFilter, statusFilter) {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  return users.filter((user) => {
    const searchableText = normalizeSearchText([
      user.usuario,
      user.nombre,
      user.apellido,
      user.cedula,
      user.correo,
      user.telefono,
    ].join(" "));

    const matchesSearch = normalizedSearchTerm
      ? searchableText.includes(normalizedSearchTerm)
      : true;
    const matchesRole = roleFilter ? user.rol === roleFilter : true;
    const matchesStatus = statusFilter ? user.estado === statusFilter : true;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().trim();
}

function RoleBadge({ role }) {
  const stylesByRole = {
    Administrador: { background: "#ede9fe", color: "#7c3aed" },
    Donador: { background: tealLight, color: tealDark },
    Transportista: { background: "#fff7ed", color: "#c2410c" },
  };
  const badgeStyle = stylesByRole[role] || { background: "#f1f5f9", color: "#475569" };

  return (
    <span style={{ ...badgeStyle, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const badgeStyle = status === "Activo"
    ? { background: "#f0fdf4", color: "#15803d" }
    : { background: "#f1f5f9", color: "#475569" };

  return (
    <span style={{ ...badgeStyle, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

const styles = {
  filterRow: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 180px 180px auto",
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
