import { Logo, Input, Btn } from "../components/UI";
import { teal, tealDark, white, gray600 } from "../tokens";

/**
 * ForgotPasswordPage
 * Props:
 *   onBack() — navigate back to login
 */
export default function ForgotPasswordPage({ onBack }) {
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
          Olvidar cuenta
        </h1>
        <p style={{ fontSize: 14, color: gray600, marginBottom: 24 }}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Correo electrónico:"
            placeholder="Por favor introduzca su correo."
          />
          <Btn style={{ width: "100%", marginTop: 8 }}>
            Enviar enlace
          </Btn>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "none",
              color: teal, fontSize: 14,
              cursor: "pointer", textAlign: "center",
              marginTop: 4,
            }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
