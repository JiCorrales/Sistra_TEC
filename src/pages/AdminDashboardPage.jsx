import { useState, useEffect } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Card, Table, TR, TD, Badge,
  Input, Select, Btn,
} from "../components/UI";
import { DetailModal } from "../components/DetailModal";
import { getAllDonations } from "../services/AdminDonations";
import { generateReport } from "../utils/reportUtils";
import AdminBeneficiariosPage from "./AdminBeneficiariosPage";
import AdminUsuariosPage from "./AdminUsuariosPage";
import AssignDonationPage from "./AssignDonationPage";

const ESTADOS = ["En tránsito", "Entregada", "Pendiente"];
const TIPOS = ["Alimentos", "Ropa", "Medicamentos", "Electrónica"];

/**
 * AdminDashboardPage
 * Props:
 *   onLogout()  — navigate back to login
 *   setScreen() — cambiar de pantalla (ej. editar usuario)
 */
export default function AdminDashboardPage({ onLogout, setScreen }) {
  const [activeTab, setActiveTab] = useState("Todas las donaciones");
  const [assigningDonation, setAssigningDonation] = useState(null);

  // Sub-page: asignar donación a transportista (flujo existente preservado)
  if (assigningDonation) {
    return <AssignDonationPage donation={assigningDonation} onBack={() => setAssigningDonation(null)} />;
  }

  const renderTab = () => {
    if (activeTab === "Beneficiarios") return <AdminBeneficiariosPage />;
    if (activeTab === "Usuarios")      return <AdminUsuariosPage />;
    return <DonacionesTab onAssign={setAssigningDonation} />;
  };

  return (
    <PageWrapper>
      <Navbar
        tabs={["Todas las donaciones", "Beneficiarios", "Usuarios"]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 32px" }}>
        <Btn onClick={() => setScreen("edit-useradmin")}>Editar usuario</Btn>
      </div>
      <div style={{ flex: 1 }}>
        {renderTab()}
      </div>
      <Footer />
    </PageWrapper>
  );
}

// ─── DONACIONES TAB ───────────────────────────────────────────────────────────
function DonacionesTab({ onAssign }) {
  // Datos crudos cargados desde el servicio (hoy mock, mañana Supabase)
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros (panel derecho) — se aplican en tiempo real
  const [filterId, setFilterId] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  // Donación seleccionada para el modal de detalles
  const [detail, setDetail] = useState(null);

  // ─── Carga inicial ───
  useEffect(() => {
    let active = true;
    getAllDonations()
      .then((data) => {
        if (active) {
          setDonations(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error al cargar donaciones del admin:", err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // ─── Filtrado en tiempo real ───
  const filtered = donations.filter((d) => {
    const haystack = `${d.id} ${d.beneficiario} ${d.donante}`.toLowerCase();
    const byText   = filterId ? haystack.includes(filterId.toLowerCase().trim()) : true;
    const byEstado = filterEstado ? d.estado === filterEstado : true;
    const byTipo   = filterTipo ? d.tipo === filterTipo : true;
    return byText && byEstado && byTipo;
  });

  const clearFilters = () => { setFilterId(""); setFilterEstado(""); setFilterTipo(""); };
  const hasFilters = Boolean(filterId || filterEstado || filterTipo);

  // ─── Métricas (sobre el total global, no el filtrado) ───
  const total      = donations.length;
  const enTransito = donations.filter((d) => d.estado === "En tránsito").length;
  const entregadas = donations.filter((d) => d.estado === "Entregada").length;

  return (
    <div style={{ display: "flex", gap: 24, padding: "28px 32px" }}>
      {/* Main content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Card title="Total Donaciones" value={total} />
          <Card title="En tránsito"      value={enTransito} />
          <Card title="Entregadas"       value={entregadas} />
        </div>

        <SectionHeader title="Todas las donaciones." />

        {loading ? (
          <div style={{ padding: 24, color: "#64748b" }}>Cargando donaciones del sistema...</div>
        ) : (
          <Table
            columns={["Donación", "Tipo de donación", "Beneficiario", "Estado", "Acciones"]}
            rows={filtered}
            renderRow={(d, i) => (
              <TR key={d.id || i}>
                <TD>{d.id}</TD>
                <TD>{d.tipo}</TD>
                <TD>{d.beneficiario}</TD>
                <TD><Badge estado={d.estado} /></TD>
                <TD>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn size="sm" variant="secondary" onClick={() => setDetail(d)}>
                      Ver detalles
                    </Btn>
                    <Btn size="sm" onClick={() => onAssign(d)}>
                      Asignar
                    </Btn>
                  </div>
                </TD>
              </TR>
            )}
          />
        )}
      </div>

      {/* Sidebar */}
      <div style={{ width: 300 }}>
        <FilterPanel
          filterId={filterId}        setFilterId={setFilterId}
          filterEstado={filterEstado} setFilterEstado={setFilterEstado}
          filterTipo={filterTipo}    setFilterTipo={setFilterTipo}
          onClear={clearFilters}     hasFilters={hasFilters}
          resultCount={filtered.length}
        />
        <ReportPanel allRows={donations} filteredRows={filtered} hasFilters={hasFilters} />
      </div>

      {/* Modal de detalles */}
      <DetailModal isOpen={Boolean(detail)} onClose={() => setDetail(null)} donation={detail} />
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({
  filterId, setFilterId,
  filterEstado, setFilterEstado,
  filterTipo, setFilterTipo,
  onClear, hasFilters, resultCount,
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
      padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <SectionHeader title="Filtrar las Donaciones" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          placeholder="ID, beneficiario o donante"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
        />
        <Select
          placeholder="Estado de la donación"
          options={ESTADOS}
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        />
        <Select
          placeholder="Tipo de donación"
          options={TIPOS}
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </span>
          <Btn size="sm" variant="ghost" onClick={onClear} style={{ opacity: hasFilters ? 1 : 0.5 }}>
            Limpiar filtros
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── REPORT PANEL ─────────────────────────────────────────────────────────────
function ReportPanel({ allRows, filteredRows, hasFilters }) {
  const [formato, setFormato] = useState("");
  const [usarFiltros, setUsarFiltros] = useState(true);

  const handleReport = () => {
    if (!formato) {
      alert("Elegí un formato para el reporte (PDF, Excel o CSV).");
      return;
    }
    const rows = usarFiltros ? filteredRows : allRows;
    if (!rows.length) {
      alert("No hay donaciones para incluir en el reporte con la selección actual.");
      return;
    }
    generateReport(formato, rows);
  };

  const cantidad = usarFiltros ? filteredRows.length : allRows.length;

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
      padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <SectionHeader title="Reporte de Donaciones" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Select
          placeholder="Elegir el formato"
          options={["PDF", "Excel", "CSV"]}
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={usarFiltros}
            onChange={(e) => setUsarFiltros(e.target.checked)}
            style={{ accentColor: "#1a9e96" }}
          />
          ¿Desea utilizar los filtros seleccionados para realizar el reporte?
        </label>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          Se incluirán {cantidad} donación{cantidad !== 1 ? "es" : ""}
          {usarFiltros && hasFilters ? " (con filtros aplicados)" : " (todas)"}.
        </span>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Btn size="sm" onClick={handleReport}>Realizar reporte</Btn>
        </div>
      </div>
    </div>
  );
}
