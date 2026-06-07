import { supabase } from "../supabaseClient";

// Mapea una fila de la tabla profiles a la forma que consume la UI del panel.
// El rol se mantiene en su valor interno (inglés); la UI lo traduce con roleLabel.
const mapProfileToUser = (profile) => ({
  id: profile.id,
  usuario: profile.username,
  nombre: profile.first_name,
  apellido: profile.last_name,
  correo: profile.username,
  telefono: profile.phone,
  rol: profile.role,
});

export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, first_name, last_name, phone, role, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapProfileToUser);
  } catch (error) {
    console.error("Error al traer los usuarios:", error);
    return [];
  }
};

// updateAdminUserAccess: actualiza el rol real del usuario en profiles.
// `rol` llega en su valor interno (inglés): admin / donor / transporter.
export const updateAdminUserAccess = async (userId, { rol }) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: rol })
      .eq("id", userId)
      .select("id, username, first_name, last_name, phone, role, created_at")
      .single();

    if (error) throw error;
    return mapProfileToUser(data);
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    return null;
  }
};
