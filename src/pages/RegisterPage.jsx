import { useState } from "react";
import { Logo, Input, Btn, BackBtn, SuccessCard } from "../components/UI";
import { teal, tealDark, white, gray200 } from "../tokens";

/**
 * RegisterPage
 * Props:
 *   onBack() — navigate back to login
 */
export default function RegisterPage({ onBack }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <SuccessCard
        emoji="✅"
        title="¡Registro exitoso!"
        message="Tu cuenta ha sido creada correctamente."
        btnLabel="Ir al inicio de sesión"
        onAction={onBack}
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
        padding: "40px 48px",
        width: 560,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "14px 0 24px", textAlign: "center" }}>
          Registrar usuario
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="Nombre de usuario:" placeholder="Por favor, introduzca su nombre de usuario" />
          <Input label="Cédula:"            placeholder="0-00000000" />
          <Input label="Nombre:"            placeholder="Por favor, introduzca su nombre." />
          <Input label="Apellido:"          placeholder="Por favor, introduzca su apellido." />
          <Input label="Correo:"            placeholder="Por favor, introduzca su correo." />
          <Input label="Teléfono"           placeholder="0000-0000" />
          <Input label="Contraseña:"        placeholder="Por favor, introduzca su contraseña."   type="password" />
          <Input label="Confirmar contraseña:" placeholder="Escribir de nuevo la contraseña."   type="password" />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
          <BackBtn onClick={onBack} />
          <Btn onClick={() => setSubmitted(true)} style={{ flex: 1 }}>
            Registrar
          </Btn>
        </div>
      </div>
    </div>
  );
}
