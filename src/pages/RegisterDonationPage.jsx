import { useState, useEffect } from "react";
import {
  PageWrapper, Footer,
  Input, Select, Btn, BackBtn, SuccessCard,
} from "../components/UI";
import { teal, tealLight, gray50, gray200, gray600 } from "../tokens";
import { supabase } from "../supabaseClient";
import { addDonation } from "../services/AddDonation"; // Ruta hacia tu archivo de servicio
import { useAuth } from "../context/AuthContext";

/**
 * RegisterDonationPage
 * Props:
 * onBack() — go back without saving
 * onDone() — called after successful registration
 */
export default function RegisterDonationPage({ onBack, onDone }) {
  const { user } = useAuth();

  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── ESTADOS DEL FORMULARIO ───
  const [donationType, setDonationType] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Estado para la lista real de la base de datos
  const [beneficiariesList, setBeneficiariesList] = useState([]);

  // ─── CARGAR BENEFICIARIOS REALES DESDE SUPABASE ───
  useEffect(() => {
    supabase
      .from("beneficiaries")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setBeneficiariesList(data);
        }
      });
  }, []);

  // Manejador para cuando seleccionan una imagen por el explorador de archivos
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Manejador para el soltado (Drop) de archivos en la zona interactiva
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  // ─── LOGICA DE ENVÍO E INTEGRACIÓN DE TU RPC ───
  const handleSubmit = async () => {
    if (!donationType || !beneficiaryId) {
      alert("Por favor rellena los campos obligatorios (*)");
      return;
    }

    if (!user?.id) {
      alert("No se pudo identificar al usuario. Inicia sesión nuevamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      let publicImageUrl = null;

      // ─── SUBIDA AL BUCKET (OPCIONAL) ───
      // if (imageFile) {
      //   const fileExt = imageFile.name.split('.').pop();
      //   const fileName = `${Date.now()}.${fileExt}`;
      //   const filePath = `donaciones/${fileName}`;

      //   const { error: uploadError } = await supabase.storage
      //     .from("donation_images") // Asegúrate de que el bucket se llame así en Supabase Storage
      //     .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      //   if (uploadError) throw uploadError;

      //   const { data: urlData } = supabase.storage
      //     .from("evidencias")
      //     .getPublicUrl(filePath);

      //   publicImageUrl = urlData.publicUrl;
      // }

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `evidencias/${fileName}`; // Cambié 'donaciones/' por 'evidencias/'

        const { error: uploadError } = await supabase.storage
          .from("donation_images") // Bucket correcto
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("donation_images") // Mismo bucket
          .getPublicUrl(filePath);

        publicImageUrl = urlData.publicUrl;
      }

      // ─── MANDAR LOS DATOS A TU ARCHIVO ADDDONATION.JS ───
      const donationData = {
        donationType,
        description,
        beneficiaryId // Enviará el ID numérico correcto para la FK
      };

      const trackingId = await addDonation(donationData, publicImageUrl, user.id);

      if (trackingId) {
        setDone(true); // Despliega la tarjeta de SuccessCard
      } else {
        alert("La base de datos rechazó la inserción. Revisa los logs.");
      }
    } catch (err) {
      console.error("Error en el flujo del formulario:", err);
      alert("Ocurrió un inconveniente al procesar el envío.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <SuccessCard
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
                  placeholder="Nombre del donante"
                  value={`${user?.user_metadata.first_name || ''} ${user?.user_metadata.last_name || ''}`}
                  disabled
                />
                
                <Select
                  placeholder="Tipo de donación *"
                  options={["Alimentos", "Ropa", "Medicamentos", "Electrónica"]}
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                />

                <Input
                  placeholder="Descripción (Describe con la mayor exactitud tu contribución)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Select dinámico de Beneficiarios mapeando la BD real */}
                <Select
                  placeholder="Beneficiario *"
                  options={beneficiariesList.map(b => b.name)}
                  value={beneficiariesList.find(b => b.id === Number(beneficiaryId))?.name || ""}
                  onChange={(e) => {
                    const selected = beneficiariesList.find(b => b.name === e.target.value);
                    setBeneficiaryId(selected ? selected.id : "");
                  }}
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
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload-input").click()}
                  style={{
                    border: `2px dashed ${dragging ? teal : gray200}`,
                    borderRadius: 8,
                    height: 180,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: dragging ? tealLight : gray50,
                    cursor: "pointer",
                    transition: "all 0.2s",
          
                    fontSize: 14,
                    textAlign: "center",
                    padding: 16,
                    position: "relative"
                  }}
                >
                  {imageFile ? (
                    <div>
                      <span style={{ fontSize: 24, display: "block" }}>📸</span>
                      <span style={{ fontWeight: 500 }}>{imageFile.name}</span>
                    </div>
                  ) : (
                    "+ Arrastre o seleccione archivo"
                  )}
                  
                  {/* Input HTML oculto encargado de disparar la carga por click */}
                  <input 
                    id="file-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
              <BackBtn onClick={onBack} disabled={isSubmitting} />
              <Btn onClick={handleSubmit} style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? "Registrando en el sistema..." : "Registrar"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageWrapper>
  );
}