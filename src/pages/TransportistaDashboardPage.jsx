import { useState } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Table, TR, TD, Badge,
  Btn,
} from "../components/UI";
import { mockDonations } from "../data/mockData";
import { white, gray200, gray600, gray800 } from "../tokens";
import DeliverLoadPage from "./DeliverLoadPage";

/**
 * TransportistaDashboardPage
 * Props:
 *   onLogout() — navigate back to login
 */
export default function TransportistaDashboardPage({ onLogout }) {
  const [delivering, setDelivering] = useState(null);

  if (delivering) {
    return <DeliverLoadPage donation={delivering} onBack={() => setDelivering(null)} />;
  }

  const myLoads = mockDonations.filter(d =>
    d.estado === "En tránsito" || d.estado === "Pendiente"
  );

  return (
    <PageWrapper>
      <Navbar
        tabs={["Donaciones asignadas"]}
        activeTab="Donaciones asignadas"
        setActiveTab={() => {}}
        onLogout={onLogout}
      />

      <div style={{ flex: 1, display: "flex", gap: 24, padding: "28px 32px" }}>
        {/* Main table */}
        <div style={{ flex: 1 }}>
          <SectionHeader title="Donaciones asignadas" />
          <Table
            columns={["Donación", "Tipo de donación", "Beneficiario", "Estado", ""]}
            rows={myLoads}
            renderRow={(d, i) => (
              <TR key={i}>
                <TD>{d.id}</TD>
                <TD>{d.tipo}</TD>
                <TD>{d.beneficiario}</TD>
                <TD><Badge estado={d.estado} /></TD>
                <TD>
                  <Btn size="sm" variant="secondary" onClick={() => setDelivering(d)}>
                    Ver detalles
                  </Btn>
                </TD>
              </TR>
            )}
          />
        </div>

        {/* Stats sidebar */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <StatBox label="Donaciones Asignadas" value={12} />
          <StatBox label="En tránsito"          value={8} />
          <StatBox label="Entregadas"            value={4} />
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: white,
      borderRadius: 10,
      border: `1px solid ${gray200}`,
      padding: 24,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 700, color: gray800 }}>{value}</div>
    </div>
  );
}
