import { useState } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Card, Table, TR, TD, Badge,
  Input, Select, Btn,
} from "../components/UI";
import { mockDonations, mockBeneficiarios } from "../data/mockData";
import AdminBeneficiariosPage from "./AdminBeneficiariosPage";
import AdminUsuariosPage from "./AdminUsuariosPage";
import AssignDonationPage from "./AssignDonationPage";

/**
 * AdminDashboardPage
 * Props:
 *   onLogout() — navigate back to login
 */
export default function AdminDashboardPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState("Todas las donaciones");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [filterId, setFilterId] = useState("");

  // Sub-page: assign donation
  if (selectedDonation) {
    return <AssignDonationPage donation={selectedDonation} onBack={() => setSelectedDonation(null)} />;
  }

  const filtered = mockDonations.filter(d =>
    d.id.toLowerCase().includes(filterId.toLowerCase()) ||
    d.beneficiario.toLowerCase().includes(filterId.toLowerCase())
  );

  const renderTab = () => {
    if (activeTab === "Beneficiarios") return <AdminBeneficiariosPage />;
    if (activeTab === "Usuarios")      return <AdminUsuariosPage />;
    return <DonacionesTab filtered={filtered} filterId={filterId} setFilterId={setFilterId} onSelect={setSelectedDonation} />;
  };

  return (
    <PageWrapper>
      <Navbar
        tabs={["Todas las donaciones", "Beneficiarios", "Usuarios"]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />
      <div style={{ flex: 1 }}>
        {renderTab()}
      </div>
      <Footer />
    </PageWrapper>
  );
}

// ─── DONACIONES TAB ───────────────────────────────────────────────────────────
function DonacionesTab({ filtered, filterId, setFilterId, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 24, padding: "28px 32px" }}>
      {/* Main content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Card title="Total Donaciones" value={12} />
          <Card title="En tránsito"      value={8} />
          <Card title="Entregadas"       value={4} />
        </div>
        <SectionHeader title="Todas las donaciones." />
        <Table
          columns={["Donación", "Tipo de donación", "Beneficiario", "Estado", ""]}
          rows={filtered}
          renderRow={(d, i) => (
            <TR key={i}>
              <TD>{d.id}</TD>
              <TD>{d.tipo}</TD>
              <TD>{d.beneficiario}</TD>
              <TD><Badge estado={d.estado} /></TD>
              <TD>
                <Btn size="sm" variant="secondary" onClick={() => onSelect(d)}>
                  Ver detalles
                </Btn>
              </TD>
            </TR>
          )}
        />
      </div>

      {/* Sidebar */}
      <div style={{ width: 300 }}>
        {/* Filter */}
        <FilterPanel filterId={filterId} setFilterId={setFilterId} />
        {/* Report */}
        <ReportPanel />
      </div>
    </div>
  );
}

function FilterPanel({ filterId, setFilterId }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
      padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <SectionHeader title="Filtrar las Donaciones" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          placeholder="Introduzca el ID de seguimiento"
          value={filterId}
          onChange={e => setFilterId(e.target.value)}
        />
        <Select placeholder="Estado de la donación" options={["En tránsito", "Entregada", "Pendiente"]} />
        <Select placeholder="Tipo de donación"       options={["Alimentos", "Ropa", "Medicamentos", "Electrónica"]} />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn size="sm">Filtrar</Btn>
        </div>
      </div>
    </div>
  );
}

function ReportPanel() {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
      padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <SectionHeader title="Reporte de Donaciones" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Select placeholder="Elegir el formato" options={["PDF", "Excel", "CSV"]} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer" }}>
          <input type="checkbox" style={{ accentColor: "#1a9e96" }} />
          ¿Desea utilizar los filtros seleccionados para realizar el reporte?
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Btn size="sm">Realizar reporte</Btn>
        </div>
      </div>
    </div>
  );
}
