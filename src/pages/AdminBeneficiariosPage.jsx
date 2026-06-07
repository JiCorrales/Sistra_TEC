import { useEffect, useMemo, useState } from "react";
import {
  SectionHeader, Table, TR, TD,
  Input, Select, Btn, BackBtn,
} from "../components/UI";
import {
  createAdminBeneficiary,
  getAdminBeneficiaries,
  toggleAdminBeneficiaryStatus,
  updateAdminBeneficiary,
} from "../services/AdminBeneficiaries";

const BENEFICIARY_STATUS_OPTIONS = ["Activo", "Inactivo"];

const EMPTY_BENEFICIARY = {
  nombre: "",
  tipo: "",
  contacto: "",
  correo: "",
  telefono: "",
  direccion: "",
  fechaInicio: "",
  estado: "Activo",
};

export default function AdminBeneficiariosPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const loadBeneficiaries = async () => {
    const loadedBeneficiaries = await getAdminBeneficiaries();
    setBeneficiaries(loadedBeneficiaries);
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const filteredBeneficiaries = useMemo(
    () => filterBeneficiaries(beneficiaries, searchTerm, statusFilter),
    [beneficiaries, searchTerm, statusFilter]
  );

  const openCreateBeneficiaryForm = () => {
    setSelectedBeneficiary(null);
    setIsFormVisible(true);
  };

  const openEditBeneficiaryForm = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsFormVisible(true);
  };

  const closeBeneficiaryForm = () => {
    setSelectedBeneficiary(null);
    setIsFormVisible(false);
  };

  const saveBeneficiary = async (beneficiaryData) => {
    if (selectedBeneficiary) {
      await updateAdminBeneficiary(selectedBeneficiary.id, beneficiaryData);
    } else {
      await createAdminBeneficiary(beneficiaryData);
    }

    await loadBeneficiaries();
    closeBeneficiaryForm();
  };

  const changeBeneficiaryStatus = async (beneficiaryId) => {
    const updatedBeneficiaries = await toggleAdminBeneficiaryStatus(beneficiaryId);
    setBeneficiaries(updatedBeneficiaries);
  };

  if (isFormVisible) {
    return (
      <BeneficiaryForm
        beneficiary={selectedBeneficiary}
        onBack={closeBeneficiaryForm}
        onSave={saveBeneficiary}
      />
    );
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={styles.headerRow}>
        <SectionHeader title="Todos los Beneficiarios" />
        <Btn size="sm" variant="secondary" onClick={openCreateBeneficiaryForm}>
          + Agregar
        </Btn>
      </div>

      <div style={styles.filterRow}>
        <Input
          placeholder="Buscar por nombre, contacto o direccion"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Select
          placeholder="Estado"
          options={BENEFICIARY_STATUS_OPTIONS}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        />
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("");
          }}
        >
          Limpiar
        </Btn>
      </div>

      <Table
        columns={["Beneficiario", "Contacto", "Telefono", "Ayudas", "Inicio", "Estado", "Acciones"]}
        rows={filteredBeneficiaries}
        renderRow={(beneficiary) => (
          <TR key={beneficiary.id} hover>
            <TD>
              <strong>{beneficiary.nombre}</strong>
              <div style={styles.secondaryText}>{beneficiary.tipo}</div>
            </TD>
            <TD>
              {beneficiary.contacto}
              <div style={styles.secondaryText}>{beneficiary.correo}</div>
            </TD>
            <TD>{beneficiary.telefono}</TD>
            <TD>{beneficiary.ayudas}</TD>
            <TD>{beneficiary.fechaInicio}</TD>
            <TD><StatusBadge status={beneficiary.estado} /></TD>
            <TD>
              <div style={styles.actionRow}>
                <Btn size="sm" variant="ghost" onClick={() => openEditBeneficiaryForm(beneficiary)}>
                  Editar
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => changeBeneficiaryStatus(beneficiary.id)}>
                  {beneficiary.estado === "Activo" ? "Desactivar" : "Activar"}
                </Btn>
              </div>
            </TD>
          </TR>
        )}
      />
    </div>
  );
}

function BeneficiaryForm({ beneficiary, onBack, onSave }) {
  const [formData, setFormData] = useState(() => ({
    ...EMPTY_BENEFICIARY,
    ...beneficiary,
  }));

  const updateFormField = (fieldName, value) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [fieldName]: value,
    }));
  };

  const submitBeneficiary = () => {
    const validationMessage = validateBeneficiaryForm(formData);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    // Keep ayudas controlled by the system, not by the registration form.
    onSave({
      nombre: formData.nombre.trim(),
      tipo: formData.tipo.trim(),
      contacto: formData.contacto.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
      fechaInicio: formData.fechaInicio,
      estado: formData.estado,
      ayudas: formData.ayudas || 0,
    });
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      <SectionHeader title={beneficiary ? "Editar Beneficiario" : "Agregar Beneficiario"} />
      <div style={styles.formCard}>
        <div style={styles.formGrid}>
          <Input
            label="Nombre del beneficiario:"
            placeholder="Nombre completo o institucion"
            value={formData.nombre}
            onChange={(event) => updateFormField("nombre", event.target.value)}
          />
          <Input
            label="Tipo:"
            placeholder="Albergue, salud, educacion..."
            value={formData.tipo}
            onChange={(event) => updateFormField("tipo", event.target.value)}
          />
          <Input
            label="Contacto:"
            placeholder="Persona encargada"
            value={formData.contacto}
            onChange={(event) => updateFormField("contacto", event.target.value)}
          />
          <Input
            label="Correo de contacto:"
            placeholder="correo@ejemplo.com"
            value={formData.correo}
            onChange={(event) => updateFormField("correo", event.target.value)}
          />
          <Input
            label="Telefono:"
            placeholder="0000-0000"
            value={formData.telefono}
            onChange={(event) => updateFormField("telefono", event.target.value)}
          />
          <Input
            label="Fecha de inicio:"
            type="date"
            value={formData.fechaInicio}
            onChange={(event) => updateFormField("fechaInicio", event.target.value)}
          />
          <Select
            label="Estado:"
            options={BENEFICIARY_STATUS_OPTIONS}
            value={formData.estado}
            onChange={(event) => updateFormField("estado", event.target.value)}
          />
          <Input
            label="Direccion:"
            placeholder="Direccion de la organizacion"
            value={formData.direccion}
            onChange={(event) => updateFormField("direccion", event.target.value)}
          />
        </div>

        <div style={styles.formActions}>
          <BackBtn onClick={onBack} />
          <Btn onClick={submitBeneficiary} style={{ flex: 1 }}>
            Guardar Beneficiario
          </Btn>
        </div>
      </div>
    </div>
  );
}

function filterBeneficiaries(beneficiaries, searchTerm, statusFilter) {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  return beneficiaries.filter((beneficiary) => {
    const searchableText = normalizeSearchText([
      beneficiary.nombre,
      beneficiary.tipo,
      beneficiary.contacto,
      beneficiary.correo,
      beneficiary.telefono,
      beneficiary.direccion,
    ].join(" "));

    const matchesSearch = normalizedSearchTerm
      ? searchableText.includes(normalizedSearchTerm)
      : true;
    const matchesStatus = statusFilter ? beneficiary.estado === statusFilter : true;

    return matchesSearch && matchesStatus;
  });
}

function validateBeneficiaryForm(formData) {
  if (!formData.nombre.trim()) return "El nombre del beneficiario es obligatorio.";
  if (!formData.contacto.trim()) return "El contacto del beneficiario es obligatorio.";
  if (!formData.telefono.trim()) return "El telefono del beneficiario es obligatorio.";
  if (!isValidEmail(formData.correo)) return "Ingrese un correo de contacto valido.";
  return null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().trim();
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
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
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
    maxWidth: 760,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  formActions: {
    display: "flex",
    gap: 12,
    marginTop: 24,
    alignItems: "center",
  },
};
