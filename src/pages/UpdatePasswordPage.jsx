import { Logo, Input, Btn, SuccessCard } from "../components/UI";
import { teal, tealDark, white, gray600, red } from "../tokens";
import { supabase } from '../supabaseClient'
import { useState } from "react";

/**
 * UpdatePasswordPage
 * Props:
 *   onDone() — navigate to login after the password was changed
 */
export default function UpdatePasswordPage({ onDone }) {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpdate = async () => {
    if (!password) {
      setError("Por favor ingrese su contraseña");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!confirmPassword) {
      setError("Por favor confirme su contraseña");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      console.log(error.message);
      setError("Ocurrió un error al actualizar la contraseña: " + error.message);
      return;
    }

    // La clave ya se cambió; cerramos la sesión temporal de recovery.
    // Si signOut falla, igual mostramos el éxito (el cambio ya quedó hecho).
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log("No se pudo cerrar la sesión de recuperación:", e);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SuccessCard
        emoji="✅"
        title="Contraseña actualizada"
        message="Tu contraseña fue cambiada. Inicia sesión con la nueva."
        btnLabel="Ir al inicio de sesión"
        onAction={onDone}
      />
    );
  }

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
          Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
        </p>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: `1.5px solid ${red}`,
            color: red,
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            label="Nueva contraseña:"
            placeholder="Por favor introduzca su nueva contraseña."
          />
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            label="Confirmar contraseña:"
            placeholder="Escribir de nuevo la contraseña."
          />
          <Btn onClick={handleUpdate} style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Actualizando..." : "Cambiar contraseña"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
