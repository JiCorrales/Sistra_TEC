import {supabase} from "../supabaseClient";
const userIdLogueado = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
export const addDonation = async (donationData, publicImageUrl) => {
    try{
        const {data: trackingId, error } = await supabase.rpc("AddDonation", {
            p_donor_id: userIdLogueado,//cHANGE 
            p_donation_type: donationData.donationType,
            p_description: donationData.description || null,
            p_beneficiary_id: parseInt(donationData.beneficiaryId, 10),
            p_donor_image: publicImageUrl || null,
            p_donor_image_url: publicImageUrl || null
        });
        if (error) throw error;

        return trackingId;
        
    }catch(error){
        console.error("No se pudo ingresar la donación:", error);
        return null;
    }

}