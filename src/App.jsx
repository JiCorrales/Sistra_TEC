import { useState, useEffect } from "react";
import LoginPage               from "./pages/LoginPage";
import ForgotPasswordPage      from "./pages/ForgotPasswordPage";
import RegisterPage            from "./pages/RegisterPage";
import AdminDashboardPage      from "./pages/AdminDashboardPage";
import DonadorDashboardPage    from "./pages/DonadorDashboardPage";
import TransportistaDashboardPage from "./pages/TransportistaDashboardPage";
import EditUserPage from "./pages/EditUserPage"

/**
 * App — root router for SISTRA-TEC (Modo Desarrollo Local)
 */
export default function App() {
  // 1. Cargamos de forma síncrona la pantalla guardada. 
  // Si no hay nada, la pestaña inicial por defecto SIEMPRE será "login" al abrir el navegador de cero.
  const [screen, setScreen] = useState(() => {
    return localStorage.getItem("sistratec_screen") || "login";
  });

  // 2. Guardamos en el disco la pantalla cada vez que cambie legítimamente
  useEffect(() => {
    localStorage.setItem("sistratec_screen", screen);
  }, [screen]);

  const handleLogin = (role) => {
    const map = {
      admin:          "app/admin",
      donador:        "app/donador",
      transportista:  "app/transport",
    };
    setScreen(map[role] || "login");
  };

  const handleLogout = () => {
    // Al salir, borramos la persistencia para que la app no se quede "atascada" en ese rol
    localStorage.removeItem("sistratec_screen");
    setScreen("login");
  };

  // Enrutador directo por Switch
  switch (screen) {
    case "forgot":
      return <ForgotPasswordPage onBack={() => setScreen("login")} />;

    case "register":
      return <RegisterPage onBack={() => setScreen("login")} />;

    case "app/admin":
      return <AdminDashboardPage onLogout={handleLogout} />;

    case "app/donador":
  return (
    <DonadorDashboardPage
      onLogout={handleLogout}
      setScreen={setScreen}
    />
  );

    case "app/transport":
      return <TransportistaDashboardPage onLogout={handleLogout} />;
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