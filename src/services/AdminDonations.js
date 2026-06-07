import { mockDonations } from "../data/mockData";
// import { supabase } from "../supabaseClient";

/**
 * getAllDonations
 * Devuelve TODAS las donaciones del sistema (vista de administrador).
 *
 * Estado actual: MODO MOCK. Devuelve los datos de prueba de mockData.
 * Se mantiene `async` a propósito para que el componente use el mismo patrón
 * de carga (loading + useEffect) que el dashboard del donador, y para que
 * migrar a Supabase sea solo descomentar el bloque de abajo.
 *
 * Para conectar a Supabase:
 *   1. Corré el SQL de supabase/GetAllDonations.sql en tu proyecto.
 *   2. Descomentá el import de supabase (arriba) y el bloque REAL de abajo.
 *   3. Borrá / comentá el `return MOCK`.
 */
export const getAllDonations = async () => {
  // ─── MODO MOCK (actual) ───────────────────────────────────────────────
  // Simula la latencia de red para que el "Cargando..." sea visible.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return mockDonations;

  // ─── MODO REAL (Supabase) — descomentar cuando exista el RPC ───────────
  // try {
  //   const { data, error } = await supabase.rpc("GetAllDonations");
  //   if (error) throw error;
  //   return data ?? [];
  // } catch (error) {
  //   console.error("Error al traer todas las donaciones:", error);
  //   return [];
  // }
};
