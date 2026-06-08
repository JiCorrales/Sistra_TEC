import { supabase } from '../supabaseClient';

export const getTransporters = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, username')
    .eq('role', 'transporter')
    .order('first_name');

  if (error) {
    console.error('Error fetching transporters:', error);
    throw new Error(error.message);
  }

  return data.map(t => ({
    id: t.id,
    label: `${t.first_name} ${t.last_name} (${t.username})`,
  }));
};

export const assignDonation = async (donationId, transporterId, estimatedDate, notes) => {
  const updateData = {
    transported_by: transporterId,
    status: 'Clasificado',   // ← Cambiado de 'En Tránsito' a 'Clasificado'
    status_updated_at: new Date().toISOString(),
  };

  if (notes && notes.trim()) {
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('description')
      .eq('id', donationId)
      .single();

    if (!fetchError && donation) {
      const currentDesc = donation.description || '';
      updateData.description = currentDesc
        ? `${currentDesc}\n\nNotas de asignación: ${notes}`
        : `Notas de asignación: ${notes}`;
    }
  }

  if (estimatedDate && notes) {
    updateData.description = (updateData.description || '') + `\nFecha estimada: ${estimatedDate}`;
  } else if (estimatedDate) {
    updateData.description = `Fecha estimada de entrega: ${estimatedDate}`;
  }

  const { data, error } = await supabase
    .from('donations')
    .update(updateData)
    .eq('id', donationId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning donation:', error);
    throw new Error(error.message);
  }

  return data;
};