import { useState } from "react";
import {
  PageWrapper, Footer, SectionHeader,
  Input, Select, Btn, BackBtn, SuccessCard,
} from "../components/UI";
import { teal, tealLight, tealDark } from "../tokens";

/**
 * AssignDonationPage
 * Props:
 *   donation — the selected donation object
 *   onBack() — go back to admin dashboard
 */
export default function AssignDonationPage({ donation, onBack }) {
  const [assigned, setAssigned] = useState(false);

  if (assigned) {
    return (
      <SuccessCard
        emoji="🚚"
        title="¡Donación asignada!"
        message={`La donación ${donation.id} fue asignada al transportista.`}
        btnLabel="Volver al dashboard"
        onAction={onBack}
      />
    );
  }

  return (
    <PageWrapper>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <SectionHeader title="Asignar donación a transportista" />

        <div style={{
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          padding: 32, maxWidth: 540, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          {/* Donation summary banner */}
          <div style={{
            background: tealLight, borderRadius: 8, padding: "12px 16px",
            marginBottom: 20, fontSize: 13, color: tealDark,
          }}>
            <strong>Donación:</strong> {donation.id} — {donation.tipo} → {donation.beneficiario}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Donante:"    value={donation.donante}      disabled />
            <Input label="Beneficiario:" value={donation.beneficiario} disabled />
            <Select
              label="Transportista:"
              placeholder="Seleccionar transportista"
              options={["trans_01", "trans_02"]}
            />
            <Input label="Fecha estimada de entrega:" type="date" />
            <Input label="Notas adicionales:"         placeholder="Instrucciones de entrega..." />

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <BackBtn onClick={onBack} />
              <Btn onClick={() => setAssigned(true)} style={{ flex: 1 }}>
                Asignar transporte
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
