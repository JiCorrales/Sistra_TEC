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
 *   donation                     — objeto de la donación seleccionada
 *   transportistaId              — uuid del transportista logueado
 *   onBack()                     — volver al dashboard
 *   onDonationUpdated()          — callback opcional para recargar métricas/lista
 *   onDeliverySuccess(donationId) — callback opcional adicional
 */
export default function DeliverLoadPage({
  donation,
  transportistaId,
  onBack,
  onDonationUpdated,
  onDeliverySuccess,
}) {
  const [delivered, setDelivered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState(null);

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

  const handleConfirm = async () => {
    if (!deliveryDate) {
      alert("Por favor ingresá la fecha de entrega.");
      return;
    }

    if (!imageFile) {
      alert("Por favor subí una foto de evidencia. La base de datos la exige.");
      return;
    }

    setIsSubmitting(true);

    try {
      let evidenceUrl = null;

      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `evidencias/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("donation_images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: imageFile.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("donation_images")
        .getPublicUrl(filePath);

      evidenceUrl = publicData?.publicUrl || null;

      if (!evidenceUrl) {
        throw new Error("No se pudo obtener la URL pública de la evidencia.");
      }

      const ok = await confirmDelivery({
        donationId: donation.id,
        confirmedBy: transportistaId,
        beneficiaryId: donation.beneficiary_id,
        deliveryDate,
        notes: notes || null,
        evidenceUrl,
      });

      if (ok) {
        onDonationUpdated?.(donation.id);
        onDeliverySuccess?.(donation.id);
        setDelivered(true);
      } else {
        alert("No se pudo registrar la entrega en Supabase. Revisá la consola.");
      }
    } catch (err) {
      console.error("Error en el flujo de confirmación:", err);
      alert(err?.message || "Ocurrió un inconveniente al procesar la entrega.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          padding: 32,
          maxWidth: 500,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            background: tealLight,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: tealDark,
          }}>
            <strong>Carga:</strong> {donation.id} — {donation.tipo} → {donation.beneficiario}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Tipo de donación:" value={donation.tipo} disabled />
            <Input label="Beneficiario:" value={donation.beneficiario} disabled />
            <Input label="Donante:" value={donation.donante} disabled />

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

            <div>
              <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>
                Evidencia fotográfica de entrega:
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
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
                    <span style={{ fontWeight: 500, color: gray600 }}>
                      {imageFile.name}
                    </span>
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