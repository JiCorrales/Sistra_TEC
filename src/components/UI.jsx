import { useState } from "react";
import {
  teal, tealDark, tealLight, navy,
  white, gray50, gray100, gray200,
  gray400, gray600, gray800, red,
} from "../tokens";

// ─── LOGO ─────────────────────────────────────────────────────────────────────
export const Logo = () => (
  <span style={{
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontWeight: 700,
    fontSize: 22,
    color: teal,
    letterSpacing: 2,
    textTransform: "uppercase",
    backgroundColor: white,
    borderRadius: "5px",
    padding: "10px"
  }}>
    SISTRA<span style={{ color: navy }}>–TEC</span>
  </span>
);

// ─── TEC LOGO ─────────────────────────────────────────────────────────────────

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ label, placeholder, type = "text", value, onChange, disabled }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 13, color: gray600, fontWeight: 500 }}>{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        border: `1.5px solid ${gray200}`,
        borderRadius: 6,
        fontSize: 14,
        color: gray800,
        background: disabled ? gray100 : white,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  </div>
);


// ─── SELECT ──────────────────────────────────────────────────────────
export const Select = ({ label, placeholder, options = [], value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 13, color: gray600, fontWeight: 500 }}>{label}</label>}
    <div style={{ position: "relative" }}>
      <select 
        value={value}       // <─── Vincula el estado actual de React
        onChange={onChange} // <─── Escucha cuando el usuario cambia de opción
        style={{
          width: "100%",
          padding: "10px 36px 10px 14px",
          border: `1.5px solid ${gray200}`,
          borderRadius: 6,
          fontSize: 14,
          // Cambia el color dinámicamente si no hay nada seleccionado (placeholder activo)
          color: value ? gray800 : gray400, 
          background: white,
          outline: "none",
          appearance: "none",
          cursor: "pointer",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          // Usamos 'value={o}' explícitamente para asegurar la consistencia del string
          <option key={o} value={o}>{o}</option> 
        ))}
      </select>
      <span style={{
        position: "absolute", right: 12, top: "50%",
        transform: "translateY(-50%)", color: gray400,
        pointerEvents: "none", fontSize: 12,
      }}>▼</span>
    </div>
  </div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = "primary", size = "md", style: extra }) => {
  const base = {
    padding: size === "sm" ? "7px 16px" : "11px 28px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: size === "sm" ? 13 : 15,
    fontWeight: 600,
    transition: "all 0.18s",
    letterSpacing: 0.3,
  };
  const variants = {
    primary:   { background: teal,          color: white },
    secondary: { background: white,         color: teal,   border: `1.5px solid ${teal}` },
    danger:    { background: red,           color: white },
    ghost:     { background: "transparent", color: gray600, border: `1.5px solid ${gray200}` },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...extra }}>
      {children}
    </button>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
// En components/UI.js o components/UI/index.js

export const Badge = ({ estado }) => {
  // Normalizar el estado para comparar sin tildes y en minúsculas
  const normalized = (estado || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let bgColor, textColor;

  switch (normalized) {
    case "recibido":
      bgColor = "#dbeafe";   // azul claro
      textColor = "#1e40af"; // azul oscuro
      break;
    case "clasificado":
      bgColor = "#fed7aa";   // naranja claro
      textColor = "#9a3412"; // naranja oscuro
      break;
    case "en transito":
    case "en tránsito":
      bgColor = "#fef3c7";   // amarillo claro
      textColor = "#92400e"; // amarillo oscuro
      break;
    case "entregado":
      bgColor = "#dcfce7";   // verde claro
      textColor = "#166534"; // verde oscuro
      break;
    default:
      bgColor = "#f1f5f9";   // gris claro
      textColor = "#475569"; // gris oscuro
      break;
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: 600,
        borderRadius: "20px",
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {estado}
    </span>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const Card = ({ title, value }) => (
  <div style={{
    background: white,
    border: `1px solid ${gray200}`,
    borderRadius: 10,
    padding: "20px 28px",
    flex: 1,
    minWidth: 160,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  }}>
    <div style={{ fontSize: 13, color: gray600, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 40, fontWeight: 700, color: gray800 }}>{value}</div>
  </div>
);

// ─── NAVBAR ───────────────────────────────────────────────────────
export const Navbar = ({ tabs, activeTab, setActiveTab, onLogout }) => {
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      onLogout();
    }
  };

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      boxSizing: "border-box",
      zIndex: 1000,
      background: tealDark,
      display: "flex",
      alignItems: "stretch",
      height: 70,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "center", paddingLeft: 24, paddingRight: 20, minWidth: 180 }}>
        <Logo />
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              background: activeTab === t ? "rgba(255,255,255,0.18)" : "transparent",
              border: "none",
              borderBottom: activeTab === t ? `3px solid ${white}` : "3px solid transparent",
              color: white,
              padding: "0 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              letterSpacing: 0.3,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <button
        onClick={handleLogout}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 20px", display: "flex", alignItems: "center", gap: "10px" }}
        title="Cerrar sesión"
      >   
        <span style={{ color: "white", fontSize: "16px", fontWeight: "600", fontFamily: "Arial, sans-serif" }}>
          Cerrar Sesión
        </span>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: white, fontSize: 20,
        }}>
          👤
        </div>
      </button>
    </nav>
  );
};

// ─── PAGE WRAPPER  ─────────────────────────────────────────────────
export const PageWrapper = ({ children }) => (
  <div style={{ 
    minHeight: "100vh", 
    background: gray50, 
    display: "flex", 
    flexDirection: "column",
    paddingTop: 70,        // <--- IMPORTANTE: Empuja el contenido hacia abajo para que el Navbar no tape nada
    boxSizing: "border-box" 
  }}>
    {children}
  </div>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export const Footer = () => (
  <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 32px 24px", borderTop: `1px solid ${gray200}` }}>
    
  </div>
);



// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
    <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${gray400}` }} />
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: gray800 }}>{title}</h2>
  </div>
);

// ─── TABLE ────────────────────────────────────────────────────────────────────
export const Table = ({ columns, rows, renderRow }) => (
  <div style={{
    border: `1px solid ${gray200}`,
    borderRadius: 8,
    overflow: "hidden",
    background: white,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map(c => (
            <th key={c} style={{
              textAlign: "left", padding: "12px 16px",
              fontSize: 13, fontWeight: 600, color: gray600,
              borderBottom: `1px solid ${gray200}`,
            }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => renderRow(row, i))}
      </tbody>
    </table>
    <div style={{ padding: "10px 16px", fontSize: 12, color: gray400, background: gray50, borderTop: `1px solid ${gray200}` }}>
      {rows.length} registro{rows.length !== 1 ? "s" : ""}
    </div>
  </div>
);

export const TR = ({ children, onClick, hover }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered && hover ? tealLight : white, transition: "background 0.15s", cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </tr>
  );
};

export const TD = ({ children }) => (
  <td style={{ padding: "12px 16px", fontSize: 14, color: gray800, borderBottom: `1px solid ${gray100}` }}>
    {children}
  </td>
);

// ─── BACK BUTTON ──────────────────────────────────────────────────────────────
export const BackBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: 38, height: 38, borderRadius: "50%",
      border: `2px solid ${gray200}`,
      background: white, cursor: "pointer",
      fontSize: 16, display: "flex",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}
  >
    ←
  </button>
);

// ─── SUCCESS CARD ─────────────────────────────────────────────────────────────
export const SuccessCard = ({ emoji, title, message, btnLabel, onAction }) => (
  <PageWrapper>
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: white, borderRadius: 12,
        padding: "40px 52px", textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>
        <h2 style={{ color: teal, margin: "8px 0" }}>{title}</h2>
        {message && <p style={{ color: gray600, fontSize: 14, margin: "8px 0 24px" }}>{message}</p>}
        <Btn onClick={onAction}>{btnLabel}</Btn>
      </div>
    </div>
  </PageWrapper>
);
