export const mockDonations = [
  { id: "DON-001", tipo: "Alimentos",     beneficiario: "Hogar Esperanza",  estado: "En tránsito", donante: "Carlos Mora" },
  { id: "DON-002", tipo: "Ropa",          beneficiario: "Casa del Niño",    estado: "Entregada",   donante: "Ana Jiménez" },
  { id: "DON-003", tipo: "Medicamentos",  beneficiario: "Cruz Roja CR",     estado: "Pendiente",   donante: "Luis Rodríguez" },
  { id: "DON-004", tipo: "Alimentos",     beneficiario: "Hogar San José",   estado: "En tránsito", donante: "María Vargas" },
  { id: "DON-005", tipo: "Electrónica",   beneficiario: "Escuela La Unión", estado: "Entregada",   donante: "Pedro Castro" },
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