import { useState } from "react";
import {
  PageWrapper, Footer, SectionHeader,
  Input, Btn, BackBtn, SuccessCard,
} from "../components/UI";
import { supabase } from "../supabaseClient";
import { confirmDelivery } from "../services/TransportistaDashboard";
import { tealLight, tealDark, gray50, gray200, gray400, gray600, teal } from "../tokens";

/**
 * DeliverLoadPage
 * Props:
 *   donation         — the selected donation/load object
 *   transportistaId  — uuid del transportista logueado
 *   onBack()         — go back to transportista dashboard
 */
export default function DeliverLoadPage({ donation, transportistaId, onBack }) {
  const [delivered, setDelivered]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragging, setDragging]         = useState(false);

  // ─── ESTADOS DEL FORMULARIO ───
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes]               = useState("");
  const [imageFile, setImageFile]       = useState(null);

  // ─── MANEJADORES DE IMAGEN ───
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  // ─── LÓGICA DE CONFIRMACIÓN ───
  const handleConfirm = async () => {
    if (!deliveryDate) {
      alert("Por favor ingresá la fecha de entrega.");
      return;
    }

    setIsSubmitting(true);

    try {
      let evidenceUrl = null;

      // ─── SUBIDA DE EVIDENCIA AL BUCKET (OPCIONAL) ───
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `evidencias/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("donation_images")
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("donation_images")
          .getPublicUrl(filePath);

        evidenceUrl = urlData.publicUrl;
      }

      // ─── INSERTAR EN delivery_confirmations (el trigger cambia el estado) ───
      const ok = await confirmDelivery({
        donationId:    donation.id,
        confirmedBy:   transportistaId,
        beneficiaryId: donation.beneficiary_id,
        notes:         notes || null,
        evidenceUrl,
      });

      if (ok) {
        setDelivered(true);
      } else {
        alert("La base de datos rechazó la confirmación. Revisá los logs.");
      }
    } catch (err) {
      console.error("Error en el flujo de confirmación:", err);
      alert("Ocurrió un inconveniente al procesar la entrega.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── PANTALLA DE ÉXITO ───
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
            <Input label="Tipo de donación:" value={donation.tipo}         disabled />
            <Input label="Beneficiario:"     value={donation.beneficiario} disabled />
            <Input label="Donante:"          value={donation.donante}      disabled />

            <Input
              label="Fecha de entrega:"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />

            <Input
              label="Notas adicionales:"
              placeholder="Instrucciones o comentarios de la entrega..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Photo upload — mismo patrón que RegisterDonationPage */}
            <div>
              <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>
                Evidencia fotográfica de entrega:
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("evidence-upload-input").click()}
                style={{
                  border: `2px dashed ${dragging ? teal : gray200}`,
                  borderRadius: 8,
                  height: 100,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: dragging ? tealLight : gray50,
                  cursor: "pointer",
                  color: gray400,
                  fontSize: 14,
                  transition: "all 0.2s",
                  textAlign: "center",
                  padding: 16,
                }}
              >
                {imageFile ? (
                  <div>
                    <span style={{ fontSize: 20, display: "block" }}>📸</span>
                    <span style={{ fontWeight: 500, color: gray600 }}>{imageFile.name}</span>
                  </div>
                ) : (
                  "+ Arrastre o seleccione foto de entrega"
                )}
                <input
                  id="evidence-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <BackBtn onClick={onBack} disabled={isSubmitting} />
              <Btn onClick={handleConfirm} style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? "Confirmando entrega..." : "Confirmar entrega"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}
