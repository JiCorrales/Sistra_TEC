import { useState } from "react";
import {
  SectionHeader, Table, TR, TD,
  Input, Btn, PageWrapper, Footer, BackBtn, SuccessCard,
} from "../components/UI";
import { mockBeneficiarios } from "../data/mockData";

/**
 * AdminBeneficiariosPage
 * Rendered as a tab inside AdminDashboardPage — no Navbar/Footer of its own.
 */
export default function AdminBeneficiariosPage() {
  const [showAdd, setShowAdd] = useState(false);

  if (showAdd) return <AddBeneficiarioPage onBack={() => setShowAdd(false)} />;

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SectionHeader title="Todos los Beneficiarios" />
        <div style={{ display: "flex", gap: 12 }}>
          <Input placeholder="Nombre de Beneficiario" />
          <Btn size="sm">Buscar</Btn>
          <Btn size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
            + Agregar
          </Btn>
        </div>
      </div>

      <Table
        columns={["Beneficiario", "Ayudas recibidas", "Fecha de inicio"]}
        rows={mockBeneficiarios}
        renderRow={(b, i) => (
          <TR key={i} hover>
            <TD>{b.nombre}</TD>
            <TD>{b.ayudas}</TD>
            <TD>{b.fechaInicio}</TD>
          </TR>
        )}
      />
    </div>
  );
}

// ─── ADD BENEFICIARIO SUB-PAGE ────────────────────────────────────────────────
function AddBeneficiarioPage({ onBack }) {
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <SuccessCard
        emoji="✅"
        title="¡Beneficiario agregado!"
        btnLabel="Volver a Beneficiarios"
        onAction={onBack}
      />
    );
  }

  return (
    <PageWrapper>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <SectionHeader title="Agregar Beneficiario" />
        <div style={{
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          padding: 32, maxWidth: 500, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Nombre del Beneficiario:" placeholder="Nombre completo o institución" />
            <Input label="Dirección:"               placeholder="Dirección de la organización" />
            <Input label="Correo de contacto:"      placeholder="correo@ejemplo.com" />
            <Input label="Teléfono:"                placeholder="0000-0000" />
            <Input label="Fecha de inicio:"         type="date" />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <BackBtn onClick={onBack} />
              <Btn onClick={() => setSaved(true)} style={{ flex: 1 }}>
                Guardar Beneficiario
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
