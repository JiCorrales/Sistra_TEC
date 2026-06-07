// Mapeo entre el valor interno del rol (inglés, el que vive en la columna
// profiles.role de Supabase) y la etiqueta visible en español que muestra la UI.
// Regla: en la base de datos SIEMPRE se guarda el valor interno (admin/donor/
// transporter); la traducción a español es solo para presentación.

export const ROLE_LABELS = {
  admin: "Administrador",
  donor: "Donador",
  transporter: "Transportista",
};

export const ROLE_VALUES = {
  Administrador: "admin",
  Donador: "donor",
  Transportista: "transporter",
};

export const ROLE_OPTIONS_ES = ["Administrador", "Donador", "Transportista"];

// roleLabel: valor interno (inglés) -> etiqueta visible (español).
export const roleLabel = (value) => ROLE_LABELS[value] || value || "";

// roleValue: etiqueta visible (español) -> valor interno (inglés).
export const roleValue = (label) => ROLE_VALUES[label] || label || "";
