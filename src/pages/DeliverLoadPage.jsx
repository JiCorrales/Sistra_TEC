import { useState } from "react";
import {
  PageWrapper, Footer, SectionHeader,
  Input, Btn, BackBtn, SuccessCard,
} from "../components/UI";
import { tealLight, tealDark, gray50, gray200, gray400, gray600 } from "../tokens";

/**
 * DeliverLoadPage
 * Props:
 *   donation — the selected donation/load object
 *   onBack() — go back to transportista dashboard
 */
export default function DeliverLoadPage({ donation, onBack }) {
  const [delivered, setDelivered] = useState(false);

  if (delivered) {
    return (
      <SuccessCard
        emoji="📦"
        title="¡Entrega confirmada!"
        message={`La donación ${donation.id} fue entregada exitosamente.`}
        btnLabel="Volver a mis cargas"
        onAction={onBack}
      />
    );
  }

  return (
    <PageWrapper>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <SectionHeader title="Confirmar entrega de carga" />

        <div style={{
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          padding: 32, maxWidth: 500, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          {/* Load summary banner */}
          <div style={{
            background: tealLight, borderRadius: 8, padding: "12px 16px",
            marginBottom: 20, fontSize: 13, color: tealDark,
          }}>
            <strong>Carga:</strong> {donation.id} — {donation.tipo} → {donation.beneficiario}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Tipo de donación:" value={donation.tipo}          disabled />
            <Input label="Beneficiario:"     value={donation.beneficiario}  disabled />
            <Input label="Donante:"          value={donation.donante}       disabled />
            <Input label="Fecha de entrega:" type="date" />

            {/* Photo upload */}
            <div>
              <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>
                Evidencia fotográfica de entrega:
              </div>
              <div style={{
                border: `2px dashed ${gray200}`,
                borderRadius: 8,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: gray50,
                cursor: "pointer",
                color: gray400,
                fontSize: 14,
              }}>
                + Cargar foto de entrega
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <BackBtn onClick={onBack} />
              <Btn onClick={() => setDelivered(true)} style={{ flex: 1 }}>
                Confirmar entrega
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
