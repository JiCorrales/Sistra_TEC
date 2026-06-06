import {supabase} from '../supabaseClient';
const userIdLogueado = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
export const getDashboardDonator = async () => {
    try {
        const { data, error } = await supabase.rpc('GetDonationDashboard', 
          { user_uuid: userIdLogueado});

        if (error) throw error;
        
        return data;
      
    } catch (error) {
      console.error("Error al traer datos del dashboard:", error);
      return [];
    }
}