import { supabase } from "../supabaseClient";

/**
 * Obtiene las donaciones asignadas a un transportista específico
 * @param {string} transportistaId - UUID del transportista (profiles.id)
 * @returns {Promise<Array>} Lista de donaciones con información del donante y beneficiario
 */
export const getTransportistaDashboard = async (transportistaId) => {
  if (!transportistaId) {
    console.warn("getTransportistaDashboard: transportistaId no proporcionado");
    return [];
  }

  try {
    // Consulta directa a la tabla donations con joins a profiles y beneficiaries
    const { data, error } = await supabase
      .from('donations')
      .select(`
        id,
        donation_type,
        description,
        donor_image_url,
        status,
        center_location,
        created_at,
        donor:donor_id (id, first_name, last_name, username),
        beneficiary:beneficiary_id (id, name, identification)
      `)
      .eq('transported_by', transportistaId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transformar datos para que coincidan con lo que espera el frontend
    const formatted = (data || []).map(d => ({
      id: d.id,
      tipo: d.donation_type,
      beneficiario: d.beneficiary?.name || 'Sin beneficiario',
      donante: d.donor ? `${d.donor.first_name} ${d.donor.last_name}` : 'Desconocido',
      estado: d.status,
      descripcion: d.description,
      imagen_url: d.donor_image_url,
      ubicacion: d.center_location,
      fecha_creacion: d.created_at,
    }));

    return formatted;
  } catch (error) {
    console.error("Error al obtener donaciones del transportista:", error);
    return [];
  }
};


/**
 * Confirma la entrega de una donación.
 * Hace:
 * 1) sube/usa la evidencia,
 * 2) registra la confirmación en delivery_confirmations,
 * 3) actualiza el estado de la donación a 'Entregado'.
 *
 * @param {Object} params
 * @param {number|string} params.donationId
 * @param {string} params.confirmedBy
 * @param {number|string|null} params.beneficiaryId
 * @param {string} params.deliveryDate - fecha elegida en el input date (YYYY-MM-DD)
 * @param {string|null} params.notes
 * @param {string} params.evidenceUrl
 * @returns {Promise<boolean>}
 */
export const confirmDelivery = async ({
  donationId,
  confirmedBy,
  beneficiaryId,
  deliveryDate,
  notes,
  evidenceUrl,
}) => {
  try {
    if (!donationId) throw new Error("Falta donationId.");
    if (!confirmedBy) throw new Error("Falta confirmedBy.");
    if (!evidenceUrl) throw new Error("Falta evidenceUrl.");
    if (!deliveryDate) throw new Error("Falta deliveryDate.");

    let beneficiaryIdentification = "";

    if (beneficiaryId) {
      const { data: benData, error: benError } = await supabase
        .from("beneficiaries")
        .select("identification")
        .eq("id", beneficiaryId)
        .single();

      if (benError) {
        console.error("No se pudo obtener la identificación del beneficiario:", benError);
      } else if (benData?.identification) {
        beneficiaryIdentification = benData.identification;
      }
    }

    const deliveryDatetime = new Date(`${deliveryDate}T12:00:00`).toISOString();

    const { error: confirmError } = await supabase
      .from("delivery_confirmations")
      .upsert(
        {
          donation_id: donationId,
          beneficiary_identification: beneficiaryIdentification || "SIN_IDENTIFICACION",
          delivery_datetime: deliveryDatetime,
          notes: notes || null,
          evidence_image_url: evidenceUrl,
          confirmed_by: confirmedBy,
        },
        { onConflict: "donation_id" }
      );

    if (confirmError) throw confirmError;

    const { error: updateError } = await supabase
      .from("donations")
      .update({
        status: "Entregado",
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", donationId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Error al confirmar entrega:", error);
    return false;
  }
};