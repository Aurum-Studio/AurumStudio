import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";

const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
);

export const Login = () => {
  const { loginAdmin, setCurrentView } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      await loginAdmin(email, password);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{
      padding: "6rem 0",
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }}>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(223, 186, 115, 0.1) 0%, rgba(0,0,0,0) 70%)",
        zIndex: -1,
        pointerEvents: "none"
      }} />

      <div 
        className="glass-panel-gold fade-in"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "3rem 2.5rem"
        }}
      >
        <button 
          onClick={() => setCurrentView("client")}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            cursor: "pointer",
            marginBottom: "1.5rem",
            padding: 0
          }}
          onMouseOver={(e) => e.target.style.color = "var(--text-primary)"}
          onMouseOut={(e) => e.target.style.color = "var(--text-secondary)"}
        >
          <ArrowLeft style={{ width: "12px", height: "12px" }} />
          Volver a la Galería
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(223, 186, 115, 0.1)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-gold)",
            marginBottom: "1rem"
          }}>
            <Lock style={{ width: "20px", height: "20px" }} />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontFamily: "var(--font-serif)" }}>Acceso Admin</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Ingresa tus credenciales para administrar la web
          </p>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            color: "#f87171",
            fontSize: "0.8rem",
            marginBottom: "1.5rem"
          }}>
            <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Mail style={{ width: "12px", height: "12px" }} /> Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Tu correo electrónico"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <KeyRound style={{ width: "12px", height: "12px" }} /> Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn-gold"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {isLoggingIn ? "Cargando..." : "Ingresar"}
          </button>
        </form>

        {!isFirebaseConfigured && (
          <div style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "rgba(223, 186, 115, 0.03)",
            border: "1px solid rgba(223, 186, 115, 0.1)",
            borderRadius: "8px",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            lineHeight: "1.5"
          }}>
            <strong>Modo Demo Activo:</strong> Puedes ingresar directamente usando:<br />
            📧 Usuario: <code style={{ color: "var(--accent-gold)" }}>admin@aurum.com</code><br />
            🔑 Clave: <code style={{ color: "var(--accent-gold)" }}>admin123</code>
          </div>
        )}
      </div>
    </div>
  );
};
