import { useState } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Table, TR, TD, Badge,
  Input, Select, Btn,
} from "../components/UI";
import { mockDonations } from "../data/mockData";
import RegisterDonationPage from "./RegisterDonationPage";

/**
 * DonadorDashboardPage
 * Props:
 *   onLogout() — navigate back to login
 */
export default function DonadorDashboardPage({ onLogout }) {
  const [activeTab, setActiveTab]       = useState("Mis donaciones");
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <RegisterDonationPage
        onBack={() => setShowRegister(false)}
        onDone={() => { setShowRegister(false); setActiveTab("Mis donaciones"); }}
      />
    );
  }

  const handleTabChange = (tab) => {
    if (tab === "Registrar donación") { setShowRegister(true); return; }
    setActiveTab(tab);
  };

  const myDonations = mockDonations.slice(0, 3);

  return (
    <PageWrapper>
      <Navbar
        tabs={["Mis donaciones", "Registrar donación"]}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={onLogout}
      />

      <div style={{ flex: 1, display: "flex", gap: 24, padding: "28px 32px" }}>
        {/* Table */}
        <div style={{ flex: 1 }}>
          <SectionHeader title="Tus Donaciones en Tiempo Real" />
          <Table
            columns={["Donación", "Tipo de donación", "Beneficiario", "Estado", ""]}
            rows={myDonations}
            renderRow={(d, i) => (
              <TR key={i}>
                <TD>{d.id}</TD>
                <TD>{d.tipo}</TD>
                <TD>{d.beneficiario}</TD>
                <TD><Badge estado={d.estado} /></TD>
                <TD><Btn size="sm" variant="secondary">Ver detalles</Btn></TD>
              </TR>
            )}
          />
        </div>

        {/* Sidebar filter */}
        <div style={{ width: 300 }}>
          <div style={{
            background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
            padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <SectionHeader title="Filtrar las Donaciones" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input placeholder="Introduzca el ID de seguimiento" />
              <Select placeholder="Estado de la donación" options={["En tránsito", "Entregada", "Pendiente"]} />
              <Select placeholder="Tipo de donación"      options={["Alimentos", "Ropa", "Medicamentos"]} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Btn size="sm">Filtrar</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
}
