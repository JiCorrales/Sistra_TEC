import { supabase } from '../supabaseClient';

export const getAdminBeneficiaries = async () => {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching beneficiaries:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createAdminBeneficiary = async (beneficiaryData) => {
  const { name, identification, start_date } = beneficiaryData;

  const { data, error } = await supabase
    .from('beneficiaries')
    .insert([
      {
        name: name.trim(),
        identification: identification.trim(),
        start_date,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating beneficiary:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateAdminBeneficiary = async (beneficiaryId, beneficiaryData) => {
  const { name, identification, start_date } = beneficiaryData;

  const { data, error } = await supabase
    .from('beneficiaries')
    .update({
      name: name.trim(),
      identification: identification.trim(),
      start_date,
    })
    .eq('id', beneficiaryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating beneficiary:', error);
    throw new Error(error.message);
  }

  return data;
};