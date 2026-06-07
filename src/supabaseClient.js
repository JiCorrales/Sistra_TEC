import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    // Necesario para el flujo de reset de contraseña por correo:
    // detectSessionInUrl procesa el token del enlace y dispara PASSWORD_RECOVERY.
    // (todos estos son los defaults de supabase-js v2; los dejamos explícitos por claridad).
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)