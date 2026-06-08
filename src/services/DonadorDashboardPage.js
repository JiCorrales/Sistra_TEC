// import {supabase} from '../supabaseClient';
// export const getDashboardDonator = async (userId) => {
//     try {
//         const { data, error } = await supabase.rpc('GetDonationDashboard',
//           { user_uuid: userId});

//         if (error) throw error;
        
//         return data;
      
//     } catch (error) {
//       console.error("Error al traer datos del dashboard:", error);
//       return [];
//     }
// }













// import { supabase } from "../supabaseClient";

// export const getDashboardDonator = async (userId) => {
//   if (!userId) {
//     console.warn("getDashboardDonator: userId no proporcionado");
//     return [];
//   }

//   try {
//     const { data, error } = await supabase
//       .from("donations")
//       .select(`
//         id,
//         donation_type,
//         description,
//         donor_image_url,
//         status,
//         created_at,
//         donor:donor_id (first_name, last_name),
//         beneficiary:beneficiary_id (name)
//       `)
//       .eq("donor_id", userId)
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     // Transformar los datos al formato esperado por el frontend
//     const formatted = (data || []).map((donation) => ({
//       id: donation.id,
//       tipo: donation.donation_type,
//       beneficiario: donation.beneficiary?.name || "Sin beneficiario",
//       donante: donation.donor
//         ? `${donation.donor.first_name} ${donation.donor.last_name}`
//         : "Desconocido",
//       estado: donation.status,
//       descripcion: donation.description,
//       imagen_donante: donation.donor_image_url,
//       fecha_creacion: donation.created_at,
//     }));

//     return formatted;
//   } catch (error) {
//     console.error("Error al obtener donaciones del donador:", error);
//     return [];
//   }
// };













import { supabase } from "../supabaseClient";

export const getDashboardDonator = async (userId) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("donations")
      .select(`
        id,
        donation_type,
        description,
        donor_image_url,
        status,
        created_at,
        donor:donor_id (first_name, last_name),
        beneficiary:beneficiary_id (name)
      `)
      .eq("donor_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((donation) => ({
      id: donation.id,                    // ← esto es número entero (ej: 19)
      tipo: donation.donation_type,
      beneficiario: donation.beneficiary?.name || "Sin beneficiario",
      donante: donation.donor
        ? `${donation.donor.first_name} ${donation.donor.last_name}`
        : "Desconocido",
      estado: donation.status,
      descripcion: donation.description,
      imagen_donante: donation.donor_image_url,
      fecha_creacion: donation.created_at,
    }));
  } catch (error) {
    console.error("Error al obtener donaciones del donador:", error);
    return [];
  }
};