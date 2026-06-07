import { useState, useEffect } from "react";
import LoginPage               from "./pages/LoginPage";
import ForgotPasswordPage      from "./pages/ForgotPasswordPage";
import RegisterPage            from "./pages/RegisterPage";
import AdminDashboardPage      from "./pages/AdminDashboardPage";
import DonadorDashboardPage    from "./pages/DonadorDashboardPage";
import TransportistaDashboardPage from "./pages/TransportistaDashboardPage";
import EditUserPage from "./pages/EditUserPage"
import UpdatePasswordPage      from "./pages/UpdatePasswordPage";
import { supabase } from "./supabaseClient";
import { useAuth } from "./context/AuthContext";

// Mapa rol -> pantalla por defecto del rol (a dónde mandar a cada usuario).
const ROLE_SCREEN = {
  admin:       "app/admin",
  donor:       "app/donador",
  transporter: "app/transport",
};

// Mapa pantalla protegida -> rol requerido para entrar a ella.
const SCREEN_ROLE = {
  "app/admin":              "admin",
  "app/donador":            "donor",
  "app/transport":          "transporter",
  "edit-useradmin":         "admin",
  "edit-userdonador":       "donor",
  "edit-usertransportista": "transporter",
};

// Una pantalla es protegida si pertenece a "app/*" o "edit-user*".
// Las públicas (login, register, forgot, update-password) quedan fuera.
const isProtectedScreen = (s) =>
  s.startsWith("app/") || s.startsWith("edit-user");

// Loader simple para no expulsar al usuario durante la carga inicial de la sesión.
function Loader() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      color: "#374151",
      fontFamily: "system-ui, sans-serif",
    }}>
      Cargando…
    </div>
  );
}

/**
 * App — root router for SISTRA-TEC (Modo Desarrollo Local)
 */
export default function App() {
  // Sesión real del usuario (rol incluido) desde AuthContext.
  const { user, loading } = useAuth();

  // 1. Cargamos de forma síncrona la pantalla guardada.
  // Si no hay nada, la pestaña inicial por defecto SIEMPRE será "login" al abrir el navegador de cero.
  const [screen, setScreen] = useState(() => {
    return localStorage.getItem("sistratec_screen") || "login";
  });

  // 2. Guardamos en el disco la pantalla cada vez que cambie legítimamente
  useEffect(() => {
    localStorage.setItem("sistratec_screen", screen);
  }, [screen]);

  // 3. Detectamos el enlace de recuperación de contraseña que llega por correo.
  // Supabase procesa el token del URL automáticamente (detectSessionInUrl=true) y
  // emite el evento PASSWORD_RECOVERY; ahí mostramos la pantalla de cambio.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setScreen("update-password");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // 4. Guardia de permisos (capa extra de defensa).
  // Si la pantalla pedida es protegida, validamos sesión + rol contra AuthContext.
  // Esto evita que alguien fuerce p.ej. sistratec_screen="app/admin" en localStorage.
  useEffect(() => {
    // Pantallas públicas: no se tocan.
    if (!isProtectedScreen(screen)) return;
    // Esperamos a que AuthContext resuelva la sesión inicial (no expulsar al cargar).
    if (loading) return;

    let active = true;

    (async () => {
      const role = user?.profile?.role;

      if (!user) {
        // Sin user en contexto: confirmamos contra Supabase antes de expulsar.
        // Justo después de iniciar sesión, AuthContext puede tardar un instante en
        // hidratar el perfil; getSession evita un "falso logout" en esa ventana.
        const { data: { session } } = await supabase.auth.getSession();
        if (active && !session) setScreen("login");
        return;
      }

      // Hay user pero su rol no corresponde a la pantalla pedida:
      // lo mandamos a la pantalla correcta de su rol (o a login si no se reconoce).
      const required = SCREEN_ROLE[screen];
      if (active && required && role !== required) {
        setScreen(ROLE_SCREEN[role] || "login");
      }
    })();

    return () => { active = false; };
  }, [screen, user, loading]);

  const handleLogin = (role) => {
    setScreen(ROLE_SCREEN[role] || "login");
  };

  const handleLogout = () => {
    // Al salir, borramos la persistencia para que la app no se quede "atascada" en ese rol
    localStorage.removeItem("sistratec_screen");
    setScreen("login");
  };

  // 5. Antes de renderizar una pantalla protegida, bloqueamos el contenido
  // mientras la guardia (efecto #4) resuelve. Así no "flasheamos" pantallas
  // protegidas a usuarios sin sesión o con rol equivocado.
  if (isProtectedScreen(screen)) {
    if (loading) return <Loader />;

    const role = user?.profile?.role;
    const required = SCREEN_ROLE[screen];

    // Sin sesión, o con rol que no corresponde: mostramos loader mientras el
    // efecto de arriba corrige la pantalla (a login o al dashboard del rol).
    if (!user) return <Loader />;
    if (required && role !== required) return <Loader />;
  }

  // Enrutador directo por Switch
  switch (screen) {
    case "forgot":
      return <ForgotPasswordPage onBack={() => setScreen("login")} />;

    case "register":
      return <RegisterPage onBack={() => setScreen("login")} />;

    case "update-password":
      return <UpdatePasswordPage onDone={() => setScreen("login")} />;

    case "app/admin":
      return <AdminDashboardPage onLogout={handleLogout} setScreen={setScreen} />;

    case "app/donador":
  return (
    <DonadorDashboardPage
      onLogout={handleLogout}
      setScreen={setScreen}
    />
  );
    case "app/transport":
      return <TransportistaDashboardPage onLogout={handleLogout} setScreen={setScreen} />;

    case "edit-userdonador":
      return <EditUserPage onBack={() => setScreen("app/donador")} />;
    case "edit-usertransportista":
      return <EditUserPage onBack={() => setScreen("app/transport")} />;
    case "edit-useradmin":
      return <EditUserPage onBack={() => setScreen("app/admin")} />;

    default:
      return (
        <LoginPage
          onLogin={handleLogin}
          onRegister={() => setScreen("register")}
          onForgot={() => setScreen("forgot")}
        />
      );
  }
}
