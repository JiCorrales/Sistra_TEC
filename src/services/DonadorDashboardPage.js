import {supabase} from '../supabaseClient';
export const getDashboardDonator = async (userId) => {
    try {
        const { data, error } = await supabase.rpc('GetDonationDashboard',
          { user_uuid: userId});

        if (error) throw error;
        
        return data;
      
    } catch (error) {
      console.error("Error al traer datos del dashboard:", error);
      return [];
    }
}