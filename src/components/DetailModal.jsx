import { useState, useEffect } from "react";
import { Btn, Badge } from "./UI";
import { white, gray200, gray400, gray600, gray800, navy, teal, tealLight } from "../tokens";
import { getDonationDetails } from "../services/DonationDetails";
import { getDonationImageUrl } from "../services/StorageService";

export const DetailModal = ({ isOpen, onClose, donation }) => {
  const [fullDetails, setFullDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [imageError, setImageError] = useState(false);

  // Cargar detalles completos cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !donation?.id) {
      setFullDetails(null);
      // setImageError(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const details = await getDonationDetails(donation.id);
        setFullDetails(details);
      } catch (err) {
        console.error("Error cargando detalles:", err);
        setFullDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, donation?.id]);

  if (!isOpen || !donation) return null;

  const safeMaxHeight = "70vh";
  const delivery = fullDetails?.delivery;

  // URL de la imagen de evidencia de entrega (si existe)
  let deliveryImageUrl = null;
  if (delivery?.evidencia_url) {
    deliveryImageUrl = delivery.evidencia_url.startsWith('http')
      ? delivery.evidencia_url
      : getDonationImageUrl({ donor_image_url: delivery.evidencia_url });
  }

  // URL de la imagen original del donante (si existe)
  const donorImageUrl = fullDetails?.imagen_donante
    ? (fullDetails.imagen_donante.startsWith('http')
        ? fullDetails.imagen_donante
        : getDonationImageUrl({ donor_image_url: fullDetails.imagen_donante }))
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      padding: 20,
      boxSizing: "border-box"
    }}>
      <div style={{
        background: white,
        borderRadius: 12,
        width: "100%",
        maxWidth: 640,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        
        {/* Encabezado */}
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${gray200}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: tealLight
        }}>
          <div>
            <span style={{ fontSize: 12, color: teal, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              Detalles de Seguimiento
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: navy }}>
              {donation.id}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 20, color: gray400, cursor: "pointer", padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: safeMaxHeight }}>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: gray600 }}>Cargando detalles...</div>
          ) : fullDetails ? (
            <>
              {/* Datos básicos */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Tipo de Donación</div>
                  <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{fullDetails.tipo}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Estado Actual</div>
                  <Badge estado={fullDetails.estado} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Beneficiario</div>
                <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{fullDetails.beneficiario}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Donante</div>
                <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{fullDetails.donante}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Descripción</div>
                <div style={{ fontSize: 14, color: gray800, background: "#f8fafc", padding: "12px 14px", borderRadius: 6, border: `1px solid ${gray200}` }}>
                  {fullDetails.descripcion || "Sin descripción adicional."}
                </div>
              </div>

              {/* Evidencia del donante (imagen original) */}
              {donorImageUrl && (
                <div>
                  <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Evidencia del Donante</div>
                  <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${gray200}`, background: "#f1f5f9", textAlign: "center" }}>
                    <img 
                      src={donorImageUrl} 
                      alt="Evidencia del donante" 
                      style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", display: "block", margin: "0 auto" }}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/640x180/f1f5f9/94a3b8?text=Imagen+no+disponible"; }}
                    />
                  </div>
                </div>
              )}

              {/* Datos de entrega (si existen) */}
              {delivery ? (
                <>
                  <div style={{ borderTop: `1px solid ${gray200}`, margin: "8px 0" }} />
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: teal }}>Información de Entrega</h4>

                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Fecha de Entrega</div>
                      <div style={{ fontSize: 14, color: gray800 }}>{formatDate(delivery.fecha)}</div>
                    </div>
                    {fullDetails.transportista && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Transportista</div>
                        <div style={{ fontSize: 14, color: gray800 }}>{fullDetails.transportista}</div>
                      </div>
                    )}
                  </div>

                  {delivery.notas && (
                    <div>
                      <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Notas de Entrega</div>
                      <div style={{ fontSize: 14, color: gray800, background: "#f8fafc", padding: "12px 14px", borderRadius: 6, border: `1px solid ${gray200}` }}>
                        {delivery.notas}
                      </div>
                    </div>
                  )}

                  {deliveryImageUrl && (
                    <div>
                      <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Evidencia de Entrega</div>
                      <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${gray200}`, background: "#f1f5f9", textAlign: "center" }}>
                        <img 
                          src={deliveryImageUrl} 
                          alt="Evidencia de entrega" 
                          style={{ maxWidth: "100%", maxHeight: 240, objectFit: "contain", display: "block", margin: "0 auto" }}
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/640x240/f1f5f9/94a3b8?text=Evidencia+no+disponible"; }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                fullDetails.estado !== "Entregado" && (
                  <div style={{ padding: 12, background: gray200, borderRadius: 8, fontSize: 13, color: gray600, textAlign: "center" }}>
                    Esta donación aún no ha sido entregada.
                  </div>
                )
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: gray600 }}>No se pudieron cargar los detalles.</div>
          )}
        </div>

        {/* Pie */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${gray200}`, display: "flex", justifyContent: "flex-end", background: "#fafafa" }}>
          <Btn onClick={onClose} variant="ghost" size="sm">Cerrar</Btn>
        </div>
      </div>
    </div>
  );
};