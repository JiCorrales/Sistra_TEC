import { supabase } from "../supabaseClient";

export const getTransportistaDashboard = async (transportistaId) => {
  try {
    const { data, error } = await supabase.rpc("GetTransportistaDashboard", {
      p_transportista_id: transportistaId,
    });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("Error al traer donaciones del transportista:", error);
    return [];
  }
};

export const confirmDelivery = async ({ donationId, confirmedBy, beneficiaryId, notes, evidenceUrl }) => {
  try {
    const { error } = await supabase.rpc("ConfirmDelivery", {
      p_donation_id:    donationId,
      p_confirmed_by:   confirmedBy,
      p_beneficiary_id: beneficiaryId,
      p_notes:          notes || null,
      p_evidence_url:   evidenceUrl || null,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error al confirmar entrega:", error);
    return false;
  }
};