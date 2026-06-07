import { Logo, Input, Btn } from "../components/UI";
import { teal, tealDark, white, gray600 } from "../tokens";
import { supabase } from '../supabaseClient'
import { useState } from "react";
/**
 * ForgotPasswordPage
 * Props:
 *   onBack() — navigate back to login
 */
export default function ForgotPasswordPage({ onBack }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async () => {
  if(!password){
    alert("Por favor ingrese su nueva contraseña");
    return;
  }
  if(password.length < 6){
    alert("La contraseña debe tener al menos 6 caracteres");
    return;
  } if(!confirmPassword){
    alert("Por favor confirme su nueva contraseña");
    return;
  }
  if(password !== confirmPassword){
    alert("Las contraseñas no coinciden");
    return;
  }
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.log(error.message);
    alert("Ocurrió un error al actualizar la contraseña: " + error.message);    
    return;
  }
  alert("Contraseña actualizada");
  setScreen("login");
};

  return (
    <div style={{
      minHeight: "100vh",
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
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "16px 0 12px", textAlign: "center" }}>
          Cambiar contraseña
        </h1>
        <p style={{ fontSize: 14, color: gray600, marginBottom: 24 }}>
          Ingresa tu nueva contraseña y confírmala.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Nueva contraseña:"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Por favor introduzca su nueva contraseña."
          />
          <Input
            label="Confirmar contraseña:"
            type="password"
            value={confirmPassword}
            placeholder="Por favor confirme su nueva contraseña."
            onChange={(e) => setConfirmPassword(e.target.value)}
          />            
          
          <Btn onClick={handleUpdatePassword} style={{ width: "100%", marginTop: 8 }}>
            Cambiar contraseña
          </Btn>          
        </div>
      </div>
    </div>
  );
}
