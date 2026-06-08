import { useState, useEffect } from "react";
import {
  PageWrapper, Footer, SectionHeader,
  Input, Select, Btn, BackBtn, SuccessCard,
} from "../components/UI";
import { tealLight, tealDark } from "../tokens";
import { getTransporters, assignDonation } from "../services/AssignDonation";

export default function AssignDonationPage({ donation, onBack }) {
  const [assigned, setAssigned] = useState(false);
  const [transporters, setTransporters] = useState([]);      // array de {id, label}
  const [selectedLabel, setSelectedLabel] = useState("");    // label del transportista seleccionado
  const [estimatedDate, setEstimatedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransporters = async () => {
      try {
        const list = await getTransporters(); // lista con {id, label}
        setTransporters(list);
        if (list.length > 0) setSelectedLabel(list[0].label);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los transportistas.");
      }
    };
    loadTransporters();
  }, []);

  const handleAssign = async () => {
    // Buscar el transportista cuyo label coincida con el seleccionado
    const selectedTransporter = transporters.find(t => t.label === selectedLabel);
    if (!selectedTransporter) {
      setError("Debe seleccionar un transportista válido.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await assignDonation(
        donation.id,
        selectedTransporter.id,
        estimatedDate,
        notes
      );
      setAssigned(true);
    } catch (err) {
      console.error(err);
      setError("Error al asignar la donación. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

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

  // Preparar array de strings para el Select
  const transporterOptions = transporters.map(t => t.label);

  return (
    <PageWrapper>
      <div style={{ flex: 1, padding: "28px 32px" }}>
        <SectionHeader title="Asignar donación a transportista" />

        <div style={{
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          padding: 32, maxWidth: 540, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            background: tealLight, borderRadius: 8, padding: "12px 16px",
            marginBottom: 20, fontSize: 13, color: tealDark,
          }}>
            <strong>Donación:</strong> {donation.id} — {donation.tipo} → {donation.beneficiario}
          </div>

          {error && (
            <div style={{ color: "#e53e3e", marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Donante:"    value={donation.donante}      disabled />
            <Input label="Beneficiario:" value={donation.beneficiario} disabled />
            <Select
              label="Transportista:"
              placeholder="Seleccionar transportista"
              options={transporterOptions}
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
            />
            <Input
              label="Fecha estimada de entrega:"
              type="date"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
            />
            <Input
              label="Notas adicionales:"
              placeholder="Instrucciones de entrega..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <BackBtn onClick={onBack} />
              <Btn onClick={handleAssign} style={{ flex: 1 }} disabled={loading}>
                {loading ? "Asignando..." : "Asignar transporte"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}