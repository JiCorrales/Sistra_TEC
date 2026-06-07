import { useState } from "react";
import { Logo, Input, Btn, BackBtn, SuccessCard } from "../components/UI";
import { teal, tealDark, white, gray200 } from "../tokens";
import { supabase } from '../supabaseClient'
/**
 * RegisterPage
 * Props:
 *   onBack() — navigate back to login
 */
export default function RegisterPage({ onBack }) {

  const [submitted, setSubmitted] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const validarCampos = () => {
    if (!nombre) {
      setSubmitted(false);
      alert("Por favor ingrese su nombre");
      return false
    }if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)){
      setSubmitted(false);
      alert("Por favor ingrese un nombre válido");
      return false
    }

    if (!apellido) {
      setSubmitted(false);
      alert("Por favor ingrese su apellido (solo letras)");
      return      false
    }
    if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)){
      setSubmitted(false);
      alert("Por favor ingrese un apellido válido (solo letras)");
      return false
    }

    if (!correo) {
      setSubmitted(false);
      alert("Por favor ingrese su correo electrónico");
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$$/.test(correo)) {
      setSubmitted(false);
      alert("Por favor ingrese un correo electrónico válido");
      return false    
    }

    if (!telefono) {
      setSubmitted(false);
      alert("Por favor ingrese su número de teléfono");
      return false
    }if(!/^[0-9]+$/.test(telefono)){
      setSubmitted(false);
      alert("Por favor ingrese solo números en el campo de teléfono");
      return false
    }
    if(telefono.length !== 8 ){
      setSubmitted(false);
      alert("Por favor ingrese un número de teléfono válido de 8 dígitos");
      return false
    }
    if (!contraseña) {
      setSubmitted(false);
      alert("Por favor ingrese su contraseña");
      return false
    }
    if(contraseña.length < 6){
      setSubmitted(false);
      alert("La contraseña debe tener al menos 6 caracteres");
      return false
    }
    if (!confirmarContraseña) {
      setSubmitted(false);
      alert("Por favor confirme su contraseña");
      return false
    }
    if (contraseña !== confirmarContraseña) {
      setSubmitted(false);
      alert("Las contraseñas no coinciden");
      return false
    }
    return true
  }
  const handleSubmit = async () => {
    if (!validarCampos()) {
      setSubmitted(false);
      return
    }

    //Crear usuario Auth
    const { data, error } =
    await supabase.auth.signUp({
      email: correo,
      password: contraseña,
    })

  if(error) {
    alert("Error al crear el usuario: " + error.message);
    return
  }

  //Crear profile enlazado
  const { error: profileError } =
    await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: correo,
        role: 'donador',
        first_name: nombre,
        last_name: apellido,
        phone: telefono
      })

  if(profileError) {
    alert("Error al crear el profile: " + profileError.message);
    return
  }

  console.log('Usuario creado')



    setSubmitted(true);
  }
    
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
          <Btn onClick={() => handleSubmit()} style={{ flex: 1 }}>
            Registrar
          </Btn>
        </div>
      </div>
    </div>
  );
}
