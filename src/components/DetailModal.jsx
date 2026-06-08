// import { Btn, Badge } from "./UI";
// import { white, gray200, gray400, gray600, gray800, navy, teal, tealLight } from "../tokens";

// export const DetailModal = ({ isOpen, onClose, donation }) => {
//   if (!isOpen || !donation) return null;

//   // ─── OPTIMIZACIÓN DE CONTROL: Validamos el nombre real de la propiedad ───
//   // Esto previene que se rompa si el servicio devuelve 'donor_image_url', 'imageUrl' o 'imagen'
//   const finalImageUrl = donation.donor_image_url || donation.imageUrl || donation.imagen || donation.foto;

//   // Pequeño parche para mitigar un error de dedo tipográfico en los estilos nativos
//   const safeMaxHeight = "70vh"; 

//   return (
//     <div style={{
//       position: "fixed",
//       top: 0,
//       left: 0,
//       width: "100vw",
//       height: "100vh",
//       background: "rgba(15, 23, 42, 0.6)", 
//       backdropFilter: "blur(4px)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 2000, 
//       padding: 20,
//       boxSizing: "border-box"
//     }}>
//       <div style={{
//         background: white,
//         borderRadius: 12,
//         width: "100%",
//         maxWidth: 640,
//         boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//         animation: "modalFadeIn 0.2s ease-out"
//       }}>
        
//         {/* Encabezado del Modal */}
//         <div style={{
//           padding: "20px 24px",
//           borderBottom: `1px solid ${gray200}`,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           background: tealLight
//         }}>
//           <div>
//             <span style={{ fontSize: 12, color: teal, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
//               Detalles de Seguimiento
//             </span>
//             <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: navy }}>
//               {donation.id}
//             </h3>
//           </div>
//           <button 
//             onClick={onClose}
//             style={{
//               background: "transparent",
//               border: "none",
//               fontSize: 20,
//               color: gray400,
//               cursor: "pointer",
//               transition: "color 0.15s",
//               padding: 4
//             }}
//             onMouseEnter={(e) => e.target.style.color = gray800}
//             onMouseLeave={(e) => e.target.style.color = gray400}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Cuerpo del Modal */}
//         <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: safeMaxHeight }}>
          
//           {/* Fila Principal: Tipo y Estado */}
//           <div style={{ display: "flex", gap: 16 }}>
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Tipo de Donación</div>
//               <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{donation.tipo}</div>
//             </div>
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Estado Actual</div>
//               <div><Badge estado={donation.estado} /></div>
//             </div>
//           </div>

//           {/* Fila Secundaria: Beneficiario */}
//           <div>
//             <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Institución Beneficiaria</div>
//             <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{donation.beneficiario}</div>
//           </div>

//           {/* Fila Tercera: Descripción */}
//           <div>
//             <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Descripción del Envío</div>
//             <div style={{ 
//               fontSize: 14, 
//               color: gray800, 
//               background: "#f8fafc", 
//               padding: "12px 14px", 
//               borderRadius: 6, 
//               border: `1px solid ${gray200}`,
//               lineHeight: 1.5
//             }}>
//               {donation.description || "Sin descripción adicional provista por el donante."}
//             </div>
//           </div>

//           {/* Fila Cuarta: Evidencia Fotográfica */}
//           <div>
//             <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Evidencia Fotográfica</div>
            
//             {/* Evaluamos la URL limpia que contenga protocolo http real */}
//             {finalImageUrl && finalImageUrl.startsWith("http") ? (
//               <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${gray200}`, background: "#f1f5f9", textAlign: "center" }}>
//                 <img 
//                   src={finalImageUrl} 
//                   alt="Evidencia de la donación" 
//                   style={{ maxWidth: "100%", maxHeight: 240, objectFit: "contain", display: "block", margin: "0 auto" }}
//                   onError={(e) => {
//                     // Fallback elegante en caso de que la URL de Supabase falle por red o esté rota
//                     e.target.onerror = null;
//                     e.target.src = "https://placehold.co/640x240/f1f5f9/94a3b8?text=Error+al+cargar+la+evidencia";
//                   }}
//                 />
//               </div>
//             ) : (
//               <div style={{ 
//                 padding: "20px", 
//                 textAlign: "center", 
//                 color: gray400, 
//                 fontSize: 13, 
//                 border: `1px dashed ${gray200}`, 
//                 borderRadius: 8 
//               }}>
//                 📷 No se adjuntó ninguna fotografía válida para este registro.
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Pie del Modal */}
//         <div style={{
//           padding: "16px 24px",
//           borderTop: `1px solid ${gray200}`,
//           display: "flex",
//           justifyContent: "flex-end",
//           background: "#fafafa"
//         }}>
//           <Btn onClick={onClose} variant="ghost" size="sm">Cerrar Ventana</Btn>
//         </div>

//       </div>
//     </div>
//   );
// };







import { Btn, Badge } from "./UI";
import { white, gray200, gray400, gray600, gray800, navy, teal, tealLight } from "../tokens";
import { getDonationImageUrl } from "../services/StorageService";

export const DetailModal = ({ isOpen, onClose, donation }) => {
  if (!isOpen || !donation) return null;

  // Usamos el servicio para obtener la URL real de la imagen
  const finalImageUrl = getDonationImageUrl(donation);

  const safeMaxHeight = "70vh";

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
        animation: "modalFadeIn 0.2s ease-out"
      }}>
        
        {/* Encabezado del Modal */}
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
          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              color: gray400,
              cursor: "pointer",
              transition: "color 0.15s",
              padding: 4
            }}
            onMouseEnter={(e) => e.target.style.color = gray800}
            onMouseLeave={(e) => e.target.style.color = gray400}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: safeMaxHeight }}>
          
          {/* Fila Principal: Tipo y Estado */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Tipo de Donación</div>
              <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{donation.tipo}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Estado Actual</div>
              <div><Badge estado={donation.estado} /></div>
            </div>
          </div>

          {/* Fila Secundaria: Beneficiario */}
          <div>
            <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Institución Beneficiaria</div>
            <div style={{ fontSize: 15, color: gray800, fontWeight: 500 }}>{donation.beneficiario}</div>
          </div>

          {/* Fila Tercera: Descripción */}
          <div>
            <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Descripción del Envío</div>
            <div style={{ 
              fontSize: 14, 
              color: gray800, 
              background: "#f8fafc", 
              padding: "12px 14px", 
              borderRadius: 6, 
              border: `1px solid ${gray200}`,
              lineHeight: 1.5
            }}>
              {donation.description || "Sin descripción adicional provista por el donante."}
            </div>
          </div>

          {/* Fila Cuarta: Evidencia Fotográfica */}
          <div>
            <div style={{ fontSize: 12, color: gray600, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Evidencia Fotográfica</div>
            
            {finalImageUrl ? (
              <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${gray200}`, background: "#f1f5f9", textAlign: "center" }}>
                <img 
                  src={finalImageUrl} 
                  alt="Evidencia de la donación" 
                  style={{ maxWidth: "100%", maxHeight: 240, objectFit: "contain", display: "block", margin: "0 auto" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/640x240/f1f5f9/94a3b8?text=Error+al+cargar+la+evidencia";
                  }}
                />
              </div>
            ) : (
              <div style={{ 
                padding: "20px", 
                textAlign: "center", 
                color: gray400, 
                fontSize: 13, 
                border: `1px dashed ${gray200}`, 
                borderRadius: 8 
              }}>
                📷 No se adjuntó ninguna fotografía válida para este registro.
              </div>
            )}
          </div>
        </div>

        {/* Pie del Modal */}
        <div style={{
          padding: "16px 24px",
          borderTop: `1px solid ${gray200}`,
          display: "flex",
          justifyContent: "flex-end",
          background: "#fafafa"
        }}>
          <Btn onClick={onClose} variant="ghost" size="sm">Cerrar Ventana</Btn>
        </div>

      </div>
    </div>
  );
};