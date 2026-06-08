import { useState, useEffect, useCallback } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Table, TR, TD, Badge, Btn,
} from "../components/UI";
import { white, gray200, gray600, gray800 } from "../tokens";
import DeliverLoadPage from "./DeliverLoadPage";
import { DetailModal } from "../components/DetailModal";
import { getTransportistaDashboard } from "../services/TransportistaDashboard";
import { useAuth } from "../context/AuthContext";

const normalizeText = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function TransportistaDashboardPage({ onLogout, setScreen }) {
  const { user } = useAuth();
  const transportistaId = user?.id;

  const [delivering, setDelivering] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDonations = useCallback(async () => {
    if (!transportistaId) return;
    setLoading(true);
    try {
      const data = await getTransportistaDashboard(transportistaId);
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando donaciones:", err);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [transportistaId]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleOpenModal = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleManage = (donation) => {
    setDelivering(donation);
  };

  if (delivering) {
    return (
      <DeliverLoadPage
        donation={delivering}
        transportistaId={transportistaId}
        onBack={() => {
          setDelivering(null);
          handleRefresh();
        }}
        onDonationUpdated={() => handleRefresh()}
      />
    );
  }

  // Métricas normalizadas
  const total = donations.length;
  const clasificadas = donations.filter(d => normalizeText(d.estado) === "clasificado").length;
  const enTransito = donations.filter(d => {
    const estado = normalizeText(d.estado);
    return estado === "en transito" || estado === "en tránsito";
  }).length;
  const entregadas = donations.filter(d => normalizeText(d.estado) === "entregado").length;

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
          ) : donations.length === 0 ? (
            <div style={{ padding: 24, color: "#64748b" }}>No hay donaciones asignadas.</div>
          ) : (
            <Table
              columns={["Donación", "Tipo", "Beneficiario", "Estado", "Acciones"]}
              rows={donations}
              renderRow={(d) => {
                const isDelivered = normalizeText(d.estado) === "entregado";
                return (
                  <TR key={d.id}>
                    <TD>{d.id}</TD>
                    <TD>{d.tipo}</TD>
                    <TD>{d.beneficiario}</TD>
                    <TD><Badge estado={d.estado} /></TD>
                    <TD>
                      {isDelivered ? (
                        <Btn size="sm" variant="secondary" onClick={() => handleOpenModal(d)}>
                          Ver detalles
                        </Btn>
                      ) : (
                        <Btn size="sm" variant="secondary" onClick={() => handleManage(d)}>
                          Gestionar
                        </Btn>
                      )}
                    </TD>
                  </TR>
                );
              }}
            />
          )}
        </div>

        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <StatBox label="Total Donaciones" value={total} />
          <StatBox label="Clasificadas" value={clasificadas} />
          <StatBox label="En tránsito" value={enTransito} />
          <StatBox label="Entregadas" value={entregadas} />
        </div>
      </div>

      <div style={{ padding: "16px 32px", borderTop: `1px solid ${gray200}`, textAlign: "right" }}>
        <Btn onClick={() => setScreen("edit-userdonador")}>Editar usuario</Btn>
      </div>

      <Footer />

      <DetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDonation(null);
        }}
        donation={selectedDonation}
      />
    </PageWrapper>
  );
}

function StatBox({ label, value }) {
  return (
    <div
      style={{
        background: white,
        borderRadius: 10,
        border: `1px solid ${gray200}`,
        padding: 24,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 700, color: gray800 }}>{value}</div>
    </div>
  );
}