import { useState } from "react";
import { Logo, Input, Btn } from "../components/UI";
import { teal, tealDark, navy, white, gray50, gray200, gray600, gray800, red } from "../tokens";

/**
 * LoginPage
 * Props:
 *   onLogin(role)  — called with "admin" | "donador" | "transportista"
 *   onRegister()   — navigate to register
 *   onForgot()     — navigate to forgot password
 */
export default function LoginPage({ onLogin, onRegister, onForgot }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (user === "admin"          && pass === "admin") { onLogin("admin");          return; }
    if (user === "donador"        && pass === "1234")  { onLogin("donador");        return; }
    if (user === "transportista"  && pass === "1234")  { onLogin("transportista");  return; }
    setError(true);
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
        textAlign: "center",
      }}>
        <Logo />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: gray800, margin: "16px 0 28px" }}>
          Iniciar sesión
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
          <Input
            label="Nombre de usuario:"
            placeholder="Por favor introduzca su nombre de usuario."
            value={user}
            onChange={e => { setUser(e.target.value); setError(false); }}
          />
          <Input
            label="Contraseña:"
            placeholder="Por favor introduzca su contraseña."
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError(false); }}
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
              ⚠ Usuario o contraseña incorrectos. Intente de nuevo.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            <button
              onClick={onForgot}
              style={{ background: "none", border: "none", color: teal, fontSize: 13, cursor: "pointer", textAlign: "left", fontStyle: "italic", padding: 0 }}
            >
              Si olvidó su contraseña, presione aquí!
            </button>
            <button
              onClick={onRegister}
              style={{ background: "none", border: "none", color: teal, fontSize: 13, cursor: "pointer", textAlign: "left", fontStyle: "italic", padding: 0 }}
            >
              Crear una nueva cuenta.
            </button>
          </div>

          <Btn onClick={handleLogin} style={{ marginTop: 8, width: "100%" }}>
            Login
          </Btn>
        </div>



        {/* Demo credentials helper */}
        <div style={{
          marginTop: 20, padding: "10px 14px",
          background: gray50, borderRadius: 8,
          fontSize: 12, color: gray600, textAlign: "left",
          border: `1px solid ${gray200}`,
        }}>
          <strong>Credenciales de demo:</strong><br />
          <code>admin</code> / <code>admin</code> → Administrador<br />
          <code>donador</code> / <code>1234</code> → Donador<br />
          <code>transportista</code> / <code>1234</code> → Transportista
        </div>
      </div>
    </div>
  );
}
