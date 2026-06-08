import { supabase } from "../supabaseClient";

/**
 * Obtiene la URL pública de una imagen almacenada en Supabase Storage.
 * @param {string} bucket - Nombre del bucket (ej. 'donation_images')
 * @param {string} path - Ruta del archivo dentro del bucket (ej. 'evidencias/foto.jpg')
 * @returns {string|null} URL pública o null si la ruta no es válida
 */
export const getPublicImageUrl = (bucket, path) => {
  if (!bucket || !path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
};

/**
 * Obtiene la URL de la imagen de una donación, ya sea porque ya es una URL completa
 * o porque tenemos una ruta relativa.
 * @param {object} donation - Objeto de donación (debe contener donor_image_url o image_path)
 * @param {string} bucket - Nombre del bucket por defecto ('donation_images')
 * @returns {string|null} URL pública válida o null
 */
export const getDonationImageUrl = (donation, bucket = "donation_images") => {
  if (!donation) return null;

  // Si ya tenemos una URL completa que empiece con http, la devolvemos directamente
  const existingUrl = donation.donor_image_url || donation.imageUrl || donation.imagen || donation.foto;
  if (existingUrl && existingUrl.startsWith("http")) {
    return existingUrl;
  }

  // Si es una ruta relativa (sin http), asumimos que está en el bucket 'donation_images'
  if (existingUrl && typeof existingUrl === "string") {
    return getPublicImageUrl(bucket, existingUrl);
  }

  // También puede haber una propiedad separada 'image_path'
  if (donation.image_path) {
    return getPublicImageUrl(bucket, donation.image_path);
  }

  return null;
};