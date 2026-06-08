import { supabase } from "../supabaseClient";

/**
 * Obtiene los detalles completos de una donación, incluyendo información de entrega.
 * @param {number} donationId - ID de la donación
 * @returns {Promise<object|null>} Objeto con los datos de la donación y entrega, o null si no existe.
 */
export const getDonationDetails = async (donationId) => {
  try {
    // 1. Obtener datos básicos de la donación con beneficiario y donante
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select(`
        id,
        donation_type,
        description,
        donor_image_url,
        status,
        center_location,
        created_at,
        donor:donor_id (id, first_name, last_name),
        beneficiary:beneficiary_id (id, name),
        transported_by (id, first_name, last_name)
      `)
      .eq('id', donationId)
      .single();

    if (donationError) throw donationError;

    // 2. Obtener confirmación de entrega (si existe)
    const { data: delivery, error: deliveryError } = await supabase
      .from('delivery_confirmations')
      .select('*')
      .eq('donation_id', donationId)
      .maybeSingle();

    if (deliveryError && deliveryError.code !== 'PGRST116') throw deliveryError;

    // 3. Construir objeto enriquecido
    const donorName = donation.donor
      ? `${donation.donor.first_name} ${donation.donor.last_name}`
      : 'Desconocido';

    const transporterName = donation.transported_by
      ? `${donation.transported_by.first_name} ${donation.transported_by.last_name}`
      : null;

    return {
      id: donation.id,
      tipo: donation.donation_type,
      beneficiario: donation.beneficiary?.name || 'Sin beneficiario',
      donante: donorName,
      estado: donation.status,
      descripcion: donation.description,
      imagen_donante: donation.donor_image_url,
      ubicacion: donation.center_location,
      fecha_creacion: donation.created_at,
      // Datos de entrega (si existen)
      delivery: delivery ? {
        fecha: delivery.delivery_datetime,
        notas: delivery.notes,
        evidencia_url: delivery.evidence_image_url,
        identificacion_beneficiario: delivery.beneficiary_identification,
        confirmado_por: delivery.confirmed_by,
      } : null,
      transportista: transporterName,
    };
  } catch (error) {
    console.error('Error obteniendo detalles de la donación:', error);
    return null;
  }
};