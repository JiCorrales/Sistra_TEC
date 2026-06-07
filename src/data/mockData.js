// Donaciones de ejemplo para el panel del administrador ("Todas las donaciones").
// Campos alineados con lo que esperan DetailModal (description, donor_image_url)
// y AssignDonationPage (donante). Cuando se conecte el RPC GetAllDonations,
// este arreglo se reemplaza por la respuesta de Supabase (ver services/AdminDonations.js).
export const mockDonations = [
  { id: "DON-001", tipo: "Alimentos",    beneficiario: "Hogar Esperanza",  estado: "En tránsito", donante: "Carlos Mora",      fecha: "2026-05-02", description: "Paquetes de arroz, frijoles y enlatados para 30 familias.", donor_image_url: "https://placehold.co/640x240/e8f7f6/157a73?text=Alimentos+DON-001" },
  { id: "DON-002", tipo: "Ropa",         beneficiario: "Casa del Niño",    estado: "Entregada",   donante: "Ana Jiménez",      fecha: "2026-04-18", description: "Ropa de invierno para niños de 4 a 10 años.", donor_image_url: "" },
  { id: "DON-003", tipo: "Medicamentos", beneficiario: "Cruz Roja CR",     estado: "Pendiente",   donante: "Luis Rodríguez",   fecha: "2026-05-21", description: "Botiquines de primeros auxilios y analgésicos.", donor_image_url: "" },
  { id: "DON-004", tipo: "Alimentos",    beneficiario: "Hogar San José",   estado: "En tránsito", donante: "María Vargas",     fecha: "2026-05-10", description: "Leche en polvo y cereales fortificados.", donor_image_url: "" },
  { id: "DON-005", tipo: "Electrónica",  beneficiario: "Escuela La Unión", estado: "Entregada",   donante: "Pedro Castro",     fecha: "2026-03-30", description: "10 computadoras portátiles reacondicionadas.", donor_image_url: "https://placehold.co/640x240/eff6ff/1d4ed8?text=Electronica+DON-005" },
  { id: "DON-006", tipo: "Ropa",         beneficiario: "Hogar Esperanza",  estado: "Pendiente",   donante: "Sofía Brenes",     fecha: "2026-05-25", description: "Calzado escolar nuevo, tallas surtidas.", donor_image_url: "" },
  { id: "DON-007", tipo: "Alimentos",    beneficiario: "Cruz Roja CR",     estado: "Entregada",   donante: "Carlos Mora",      fecha: "2026-04-05", description: "Agua embotellada y barras energéticas.", donor_image_url: "" },
  { id: "DON-008", tipo: "Medicamentos", beneficiario: "Casa del Niño",    estado: "En tránsito", donante: "Diego Solano",     fecha: "2026-05-15", description: "Jarabes pediátricos y vitaminas.", donor_image_url: "" },
  { id: "DON-009", tipo: "Electrónica",  beneficiario: "Escuela La Unión", estado: "Pendiente",   donante: "Ana Jiménez",      fecha: "2026-05-28", description: "Proyector y bocinas para el aula multimedia.", donor_image_url: "" },
  { id: "DON-010", tipo: "Ropa",         beneficiario: "Hogar San José",   estado: "Entregada",   donante: "Valeria Quirós",   fecha: "2026-04-22", description: "Cobijas y ropa de cama para 20 camas.", donor_image_url: "" },
  { id: "DON-011", tipo: "Alimentos",    beneficiario: "Hogar Esperanza",  estado: "En tránsito", donante: "Luis Rodríguez",   fecha: "2026-05-19", description: "Frutas y verduras frescas de la feria del agricultor.", donor_image_url: "" },
  { id: "DON-012", tipo: "Medicamentos", beneficiario: "Cruz Roja CR",     estado: "Entregada",   donante: "María Vargas",     fecha: "2026-03-12", description: "Insumos de curación y alcohol en gel.", donor_image_url: "" },
];

export const mockUsers = [
  { id: "USR-001", usuario: "admin_tec",   rol: "Administrador" },
  { id: "USR-002", usuario: "carlos_mora", rol: "Donador" },
  { id: "USR-003", usuario: "trans_01",    rol: "Transportista" },
  { id: "USR-004", usuario: "ana_jimenez", rol: "Donador" },
  { id: "USR-005", usuario: "trans_02",    rol: "Transportista" },
];

export const mockBeneficiarios = [
  { id: "BEN-001", nombre: "Hogar Esperanza",  ayudas: 14, fechaInicio: "2023-01-15" },
  { id: "BEN-002", nombre: "Casa del Niño",    ayudas: 8,  fechaInicio: "2022-06-20" },
  { id: "BEN-003", nombre: "Cruz Roja CR",     ayudas: 22, fechaInicio: "2021-03-10" },
  { id: "BEN-004", nombre: "Escuela La Unión", ayudas: 5,  fechaInicio: "2024-02-01" },
];