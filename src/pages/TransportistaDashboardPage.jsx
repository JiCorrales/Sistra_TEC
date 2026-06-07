import { useState, useEffect } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Table, TR, TD, Badge, Btn,
} from "../components/UI";
import { white, gray200, gray600, gray800 } from "../tokens";
import DeliverLoadPage from "./DeliverLoadPage";
import { getTransportistaDashboard } from "../services/TransportistaDashboard";

// Reemplazá este ID por el del usuario logueado cuando se integre AuthContext
const TRANSPORTISTA_ID = "uuid-del-transportista-logueado";

/**
 * TransportistaDashboardPage
 * Props:
 *   onLogout() — navigate back to login
 */
export default function TransportistaDashboardPage({ onLogout, setScreen }) {
  const [delivering, setDelivering] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTransportistaDashboard(TRANSPORTISTA_ID).then((data) => {
      if (active) {
        setDonations(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  if (delivering) {
    return (
      <DeliverLoadPage
        donation={delivering}
        transportistaId={TRANSPORTISTA_ID}
        onBack={() => {
          setDelivering(null);
          // Refrescar la lista después de confirmar
          setLoading(true);
          getTransportistaDashboard(TRANSPORTISTA_ID).then((data) => {
            setDonations(Array.isArray(data) ? data : []);
            setLoading(false);
          });
        }}
      />
    );
  }

  const enTransito  = donations.filter(d => d.estado === "En tránsito").length;
  const pendientes  = donations.filter(d => d.estado === "Pendiente").length;

  return (
    <PageWrapper>
      <Navbar
        tabs={["Donaciones asignadas"]}
        activeTab="Donaciones asignadas"
        setActiveTab={() => {}}
        onLogout={onLogout}
      />

      <div style={{ flex: 1, display: "flex", gap: 24, padding: "28px 32px" }}>
        <div style={{ flex: 1 }}>
          <SectionHeader title="Donaciones asignadas" />
          {loading ? (
            <div style={{ padding: 24, color: "#64748b" }}>Cargando cargas asignadas...</div>
          ) : (
            <Table
              columns={["Donación", "Tipo de donación", "Beneficiario", "Estado", ""]}
              rows={donations}
              renderRow={(d, i) => (
                <TR key={d.id || i}>
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
          )}
        </div>

        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <StatBox label="Donaciones Asignadas" value={donations.length} />
          <StatBox label="En tránsito"          value={enTransito} />
          <StatBox label="Pendientes"           value={pendientes} />
        </div>
      </div>

      <Footer />
      <Btn onClick={() => setScreen("edit-userdonador")}>
    Editar usuario
  </Btn>
    </PageWrapper>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: white, borderRadius: 10,
      border: `1px solid ${gray200}`, padding: 24,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 700, color: gray800 }}>{value}</div>
    </div>
  );
}
