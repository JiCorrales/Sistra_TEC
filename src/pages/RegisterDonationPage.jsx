import { useState } from "react";
import {
  PageWrapper, Footer, SectionHeader,
  Input, Select, Btn, BackBtn, SuccessCard,
} from "../components/UI";
import { mockBeneficiarios } from "../data/mockData";
import { teal, tealLight, gray50, gray200, gray400, gray600 } from "../tokens";

/**
 * RegisterDonationPage
 * Props:
 *   onBack() — go back without saving
 *   onDone() — called after successful registration
 */
export default function RegisterDonationPage({ onBack, onDone }) {
  const [done, setDone]       = useState(false);
  const [dragging, setDragging] = useState(false);

  if (done) {
    return (
      <SuccessCard
        emoji="🎉"
        title="¡Donación registrada!"
        message="Tu donación fue registrada exitosamente. Puedes darle seguimiento en tiempo real."
        btnLabel="Ver mis donaciones"
        onAction={onDone}
      />
    );
  }

  return (
    <PageWrapper>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{
            background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
            padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #94a3b8" }} />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Registrar una nueva donación.
              </h2>
            </div>
            <p style={{ color: teal, fontWeight: 500, fontSize: 14, margin: "0 0 24px 32px" }}>
              En esta ventana podrás registrar una nueva donación para poder darle seguimiento en tiempo real.
            </p>

            {/* Form grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Left column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input
                  placeholder="Nombre del donante (Obtenido desde el perfil, no se puede modificar)"
                  value="Carlos Mora"
                  disabled
                />
                <Select
                  placeholder="Tipo de donación"
                  options={["Alimentos", "Ropa", "Medicamentos", "Electrónica"]}
                />
                <Input
                  placeholder="Descripción  (Describe con la mayor exactitud tu contribución)"
                />
                <Select
                  placeholder="Beneficiario"
                  options={mockBeneficiarios.map(b => b.nombre)}
                />
              </div>

              {/* Right column — file drop zone */}
              <div>
                <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>
                  Evidencia fotográfica (Opcional)
                </div>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); }}
                  style={{
                    border: `2px dashed ${dragging ? teal : gray200}`,
                    borderRadius: 8,
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: dragging ? tealLight : gray50,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    color: gray400,
                    fontSize: 14,
                  }}
                >
                  + Arrastre o seleccione archivo
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
              <BackBtn onClick={onBack} />
              <Btn onClick={() => setDone(true)} style={{ flex: 1 }}>
                Registrar
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
