import { useState, useEffect } from "react";
import {
  Navbar, PageWrapper, Footer,
  SectionHeader, Table, TR, TD, Badge,
  Input, Select, Btn,
} from "../components/UI";
import { DetailModal } from "../components/DetailModal";
import RegisterDonationPage from "./RegisterDonationPage";
import { getDashboardDonator } from "../services/DonadorDashboardPage";

export default function DonadorDashboardPage({ onLogout, setScreen }) {
  const [activeTab, setActiveTab] = useState("Mis donaciones");
  const [showRegister, setShowRegister] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);

  // Datos crudos de la Base de Datos
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── ESTADOS PARA LOS FILTROS (Panel Derecho) ───
  const [searchId, setSearchId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  // Estados para el Pop-up de detalles
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleEditUser = () => {
  setScreen("edit-userdonador");
};

  // ─── 1. FUNCIÓN DE CARGA REUTILIZABLE ───
  const loadDonations = () => {
    setLoading(true);
    getDashboardDonator()
      .then(data => {
        setRows(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener donaciones:", error);
        setLoading(false);
      });
  };

  // ─── 2. CARGA INICIAL AL MONTAR EL COMPONENTE ───
  useEffect(() => {
    loadDonations();
  }, []);

  // ─── 3. MANEJADOR MÁGICO PARA CUANDO SE TERMINA DE REGISTRAR ───
  const handleDonationRegistered = () => {
    setShowRegister(false); 
    setActiveTab("Mis donaciones"); 
    loadDonations(); // <─── ¡Fuerza la consulta a Supabase para traer lo más nuevo!
  };

  const handleOpenDetails = (donacion) => {
    setSelectedDonation(donacion);
    setIsModalOpen(true);
  };

 

  const handleTabChange = (tab) => {
    if (tab === "Registrar donación") { 
      setShowRegister(true); 
      return; 
    }
    setActiveTab(tab);
  };

  if (showRegister) {
    return (
      <RegisterDonationPage
        onBack={() => setShowRegister(false)}
        onDone={handleDonationRegistered} // <─── Enlazamos la nueva función controladora aquí
      />
    );
  }

  // ─── LÓGICA DE FILTRADO EN TIEMPO REAL ───
  const filteredRows = rows.filter((row) => {
    // Evitamos caídas si row.id viene indefinido de forma síncrona
    const rowIdStr = row.id ? String(row.id) : "";
    const matchesId = searchId 
      ? rowIdStr.toLowerCase().includes(searchId.toLowerCase().trim()) 
      : true;

    const matchesStatus = filterStatus 
      ? row.estado === filterStatus 
      : true;

    const matchesType = filterType 
      ? row.tipo === filterType 
      : true;

    return matchesId && matchesStatus && matchesType;
  });

  return (
    <PageWrapper>
      <Navbar
  tabs={["Mis donaciones", "Registrar donación"]}
  activeTab={activeTab}
  setActiveTab={handleTabChange}
  onLogout={onLogout}  
/>
<div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 32px" }}>
  <Btn onClick={() => setScreen("edit-userdonador")}>
    Editar usuario
  </Btn>
</div>


      <div style={{ flex: 1, display: "flex", gap: 24, padding: "28px 32px" }}>
        
        {/* Tabla (Lado Izquierdo) */}
        <div style={{ flex: 1 }}>
          <SectionHeader title="Tus Donaciones en Tiempo Real" />
          
          {loading ? (
            <div style={{ padding: 24, color: "#64748b" }}>Cargando tus donaciones desde el sistema...</div>
          ) : (
            <Table
              columns={["Donación", "Tipo de donación", "Beneficiario", "Estado", "Acciones"]}
              rows={filteredRows}
              renderRow={(row) => (
                <TR key={row.id}>
                  <TD>{row.id}</TD>
                  <TD>{row.tipo}</TD>
                  <TD>{row.beneficiario}</TD>
                  <TD><Badge estado={row.estado} /></TD>
                  <TD>
                    <Btn 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleOpenDetails(row)}
                    >
                      Ver detalles
                    </Btn>
                  </TD>
                </TR>
              )}
            />
          )}
        </div>
          
        {/* Panel Lateral de Filtros (Lado Derecho) */}
        <div style={{ width: 300 }}>
          <div style={{
            background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
            padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <SectionHeader title="Filtrar las Donaciones" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              
              <Input 
                placeholder="Introduzca el ID de seguimiento" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              
              <Select 
                placeholder="Estado de la donación" 
                options={["Recibido", "Clasificado", "En Tránsito", "Entregado"]} 
                onChange={(e) => setFilterStatus(e.target.value)}
              />
              
              <Select 
                placeholder="Tipo de donación" 
                options={["Alimentos", "Ropa", "Medicamentos"]} 
                onChange={(e) => setFilterType(e.target.value)}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <Btn 
                  size="sm" 
                  variant="ghost"
                  onClick={() => { setSearchId(""); setFilterStatus(""); setFilterType(""); }}
                >
                  Limpiar Filtros
                </Btn>
              </div>

            </div>
          </div>
        </div>
      </div>

      <DetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        donation={selectedDonation} 
      />

      <Footer />
    </PageWrapper>
  );
  
}