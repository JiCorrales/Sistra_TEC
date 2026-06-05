import { useState } from "react";
import LoginPage              from "./pages/LoginPage";
import ForgotPasswordPage     from "./pages/ForgotPasswordPage";
import RegisterPage           from "./pages/RegisterPage";
import AdminDashboardPage     from "./pages/AdminDashboardPage";
import DonadorDashboardPage   from "./pages/DonadorDashboardPage";
import TransportistaDashboardPage from "./pages/TransportistaDashboardPage";

/**
 * App — root router for SISTRA-TEC
 *
 * Screens:
 *   "login"          → LoginPage
 *   "forgot"         → ForgotPasswordPage
 *   "register"       → RegisterPage
 *   "app/admin"      → AdminDashboardPage
 *   "app/donador"    → DonadorDashboardPage
 *   "app/transport"  → TransportistaDashboardPage
 */
export default function App() {
  const [screen, setScreen] = useState("login");

  const handleLogin = (role) => {
    const map = {
      admin:          "app/admin",
      donador:        "app/donador",
      transportista:  "app/transport",
    };
    setScreen(map[role] || "login");
  };

  const handleLogout = () => setScreen("login");

  switch (screen) {
    case "forgot":
      return <ForgotPasswordPage onBack={() => setScreen("login")} />;

    case "register":
      return <RegisterPage onBack={() => setScreen("login")} />;

    case "app/admin":
      return <AdminDashboardPage onLogout={handleLogout} />;

    case "app/donador":
      return <DonadorDashboardPage onLogout={handleLogout} />;

    case "app/transport":
      return <TransportistaDashboardPage onLogout={handleLogout} />;

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