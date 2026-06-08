import { useState, useEffect } from "react";
import { Logo, Input, Btn, BackBtn, SuccessCard } from "../components/UI";
import { teal, tealDark, white } from "../tokens";
import { supabase } from '../supabaseClient'

export default function EditUserPage({ onBack }) {
  const [submitted, setSubmitted] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");

  // Cargar datos actuales del usuario al iniciar
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const userEmail = session.user.email;

      // Obtener perfil desde la tabla 'profiles'
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, username")
        .eq("id", userId)
        .single();

      if (!error && profile) {
        setNombre(profile.first_name || "");
        setApellido(profile.last_name || "");
        setTelefono(profile.phone || "");
        // El correo lo tomamos del auth, no del perfil (aunque username suele ser el correo)
        setCorreo(userEmail || profile.username || "");
      } else {
        // Fallback: usar el email del auth
        setCorreo(userEmail || "");
      }
    };

    loadUserData();
  }, []);

  // Validación: solo se validan los campos que NO están vacíos
  const validarCampos = () => {
    // Nombre (solo si se proporcionó)
    if (nombre.trim() !== "") {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
        alert("Por favor ingrese un nombre válido (solo letras)");
        return false;
      }
    }

    // Apellido (solo si se proporcionó)
    if (apellido.trim() !== "") {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
        alert("Por favor ingrese un apellido válido (solo letras)");
        return false;
      }
    }

    // Correo (solo si se proporcionó)
    if (correo.trim() !== "") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        alert("Por favor ingrese un correo electrónico válido");
        return false;
      }
    }

    // Teléfono (solo si se proporcionó)
    if (telefono.trim() !== "") {
      if (!/^[0-9]+$/.test(telefono)) {
        alert("Por favor ingrese solo números en el campo de teléfono");
        return false;
      }
      if (telefono.length !== 8) {
        alert("Por favor ingrese un número de teléfono válido de 8 dígitos");
        return false;
      }
    }

    // Contraseña: solo si al menos uno de los dos campos tiene texto
    if (contraseña.trim() !== "" || confirmarContraseña.trim() !== "") {
      if (contraseña.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
      if (contraseña !== confirmarContraseña) {
        alert("Las contraseñas no coinciden");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarCampos()) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      alert("No se pudo identificar al usuario");
      return;
    }

    // Construir objeto de actualización solo con campos no vacíos
    const profileUpdates = {};
    if (nombre.trim() !== "") profileUpdates.first_name = nombre;
    if (apellido.trim() !== "") profileUpdates.last_name = apellido;
    if (telefono.trim() !== "") profileUpdates.phone = telefono;
    if (correo.trim() !== "") profileUpdates.username = correo; // El campo username almacena el correo

    // Actualizar perfil solo si hay cambios
    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (error) {
        alert("Error al actualizar el perfil: " + error.message);
        return;
      }
    }

    // Actualizar autenticación (email y/o contraseña)
    const authUpdates = {};
    if (correo.trim() !== "") authUpdates.email = correo;
    if (contraseña.trim() !== "") authUpdates.password = contraseña;

    if (Object.keys(authUpdates).length > 0) {
      const { error } = await supabase.auth.updateUser(authUpdates);
      if (error) {
        alert("Error al actualizar credenciales: " + error.message);
        return;
      }
    }

    // Si no se envió ninguna actualización
    if (Object.keys(profileUpdates).length === 0 && Object.keys(authUpdates).length === 0) {
      alert("No se ha modificado ningún campo");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SuccessCard
        emoji="✅"
        title="Usuario editado exitosamente"
        message="Tu cuenta ha sido actualizada correctamente."
        btnLabel="Volver"
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
          Editar usuario
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input
            label="Nombre:"
            placeholder="Por favor, introduzca su nombre."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            label="Apellido:"
            placeholder="Por favor, introduzca su apellido."
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          <Input
            label="Correo:"
            placeholder="Por favor, introduzca su correo."
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <Input
            label="Teléfono"
            placeholder="12345678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <Input
            label="Contraseña:"
            placeholder="Por favor, introduzca su contraseña."
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
          <Input
            label="Confirmar contraseña:"
            placeholder="Escribir de nuevo la contraseña."
            type="password"
            value={confirmarContraseña}
            onChange={(e) => setConfirmarContraseña(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
          <BackBtn onClick={onBack} />
          <Btn onClick={handleSubmit} style={{ flex: 1 }}>
            Editar
          </Btn>
        </div>
      </div>
    </div>
  );
}