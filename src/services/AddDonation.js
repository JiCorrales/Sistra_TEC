import {supabase} from "../supabaseClient";
export const addDonation = async (donationData, publicImageUrl, donorId) => {
    try{
        const {data: trackingId, error } = await supabase.rpc("AddDonation", {
            p_donor_id: donorId,
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