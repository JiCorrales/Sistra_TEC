import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Estilos globales de foco accesible
const globalStyles = `
:focus-visible {
  outline: 3px solid #f97316 !important;      /* Naranja brillante, alto contraste */
  outline-offset: 2px !important;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3) !important; /* Sombra adicional para resaltar */
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 3px solid #f97316 !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3) !important;
}
`;

// Inyectar estilos en el <head>
const styleTag = document.createElement('style');
styleTag.textContent = globalStyles;
document.head.appendChild(styleTag);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);