import { useState } from "react";
import { Logo, Input, Btn } from "../components/UI";
import { teal, tealDark, white, gray50, gray200, gray600, gray800, red } from "../tokens";
import { supabase } from '../supabaseClient'

/**
 * LoginPage
 * Props:
 *   onLogin(role)  — called with "admin" | "donador" | "transportista"
 *   onRegister()   — navigate to register
 *   onForgot()     — navigate to forgot password
 */
export default function LoginPage({ onLogin, onRegister, onForgot }) {
  const [error, setError] = useState(false);
  const [msjError, setMsjError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // 1. Intentar autenticación 
    //Ver errores
    if(!email){
      setMsjError('Por favor ingrese su correo electrónico');
      setError(true);
      return
    }if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$$/.test(email)){
      setMsjError('Por favor ingrese un correo electrónico válido');
      setError(true);
      return
    }
    if(!password){
      setMsjError('Por favor ingrese su contraseña');
      setError(true);
      return
    }
        const { data: authData, error: authError } = 
        await supabase.auth.signInWithPassword({ email, password }) 
  if (authError) { 
    // Email no confirmado 
    if ( authError.message.includes('Email not confirmed') ) 
      {
        setError(true);
        setMsjError('Debes confirmar tu correo electrónico');
       return 
      } 
    // Correo o contraseña incorrectos
    if ( authError.message.includes('Invalid login credentials') ) 
        {
          setError(true);
          setMsjError('Correo o contraseña incorrectos');
           return 
        } 
    // Otro error 
    setError(true);
    setMsjError('Ocurrió un error al intentar iniciar sesión' + authError.message);
    return { success: false, message: authError.message } 
  } 
  //Obtener usuario autenticado
  const user = authData.user 
  //Buscar perfil
  const { data: profile, error: profileError } = 
    await supabase.from('profiles').select('role, id').eq('id', user.id).maybeSingle()
  if (profileError) {
    setError(true);
    setMsjError('Ocurrió un error al cargar el perfil: ' + profileError.message);
     return { success: false, message: 'No se pudo cargar el perfil' } 
  } 
  // 5. Retornar datos combinados
  setError(false);
  setMsjError('');
  console.log('Perfil cargado:', profile);
  onLogin(profile.role); //profile.role
  
  return { success: true, 
    session: authData.session, 
    user: { id: user.id, role: profile.role } }
  }; 
  /** 
  return { success: true,      
    user: { id: 1, role:"donador" } }
  };
  */

  return (
    <>
    <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow-x: hidden;
        }
      `}</style>
    <div style={{
      width: "100vw",
      height: "100vh",
      background: `linear-gradient(135deg, ${teal} 0%, ${tealDark} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: white,
        borderRadius: 12,
        padding: "48px 52px",
        width: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        textAlign: "center",
      }}>
        <Logo />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: gray800, margin: "16px 0 28px" }}>
          Iniciar sesión
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
          <Input
            label="Correo electrónico:"
            placeholder="Por favor introduzca su correo electrónico."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
            
          />
          <Input
            label="Contraseña:"
            placeholder="Por favor introduzca su contraseña."
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div style={{
              background: "#fef2f2",
              border: `1px solid #fca5a5`,
              borderRadius: 6,
              padding: "10px 14px",
              fontSize: 13,
              color: red,
            }}>
              ⚠ {msjError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            <button
              onClick={onForgot}
              style={{ background: "none", border: "none", color: teal, fontSize: 13, cursor: "pointer", textAlign: "left", fontStyle: "italic", padding: 0 }}
            >
              Si olvidó su contraseña, presione aquí
            </button>
            <button
              onClick={onRegister}
              style={{ background: "none", border: "none", color: teal, fontSize: 13, cursor: "pointer", textAlign: "left", fontStyle: "italic", padding: 0 }}
            >
              Crear una nueva cuenta.
            </button>
          </div>

          <Btn onClick={handleLogin} style={{ marginTop: 8, width: "100%" }}>
            Iniciar Sesión
          </Btn>
        </div>



        {/* Demo credentials helper */}
        <div style={{
          marginTop: 20, padding: "10px 14px",
          background: gray50, borderRadius: 8,
          fontSize: 12, color: gray600, textAlign: "left",
          border: `1px solid ${gray200}`,
        }}>
          
        </div>
      </div>
    </div>
    </>
  );
}
