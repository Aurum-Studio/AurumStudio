import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Lock, Mail, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff, ShieldX } from "lucide-react";

const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
);

// =====================
// POPUP DE ERROR PREMIUM
// =====================
const ErrorPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      animation: "fadeIn 0.25s ease"
    }}>
      {/* Fondo difuminado */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)"
        }}
      />

      {/* Tarjeta del popup */}
      <div style={{
        position: "relative",
        background: "linear-gradient(145deg, #1a1008, #0e0a04)",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        borderRadius: "20px",
        padding: "2.5rem 2.5rem 2rem",
        maxWidth: "360px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 0 60px rgba(239, 68, 68, 0.15), 0 25px 50px rgba(0,0,0,0.5)",
        animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}>
        {/* Ícono */}
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 70%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
          color: "#f87171"
        }}>
          <ShieldX style={{ width: "28px", height: "28px" }} />
        </div>

        {/* Título */}
        <h3 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.4rem",
          color: "#fff",
          marginBottom: "0.6rem"
        }}>
          Acceso Denegado
        </h3>

        {/* Mensaje */}
        <p style={{
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.55)",
          lineHeight: "1.6",
          marginBottom: "1.75rem"
        }}>
          Las credenciales ingresadas no son correctas. Por favor verifica tu correo y contraseña.
        </p>

        {/* Barra de progreso */}
        <div style={{
          height: "2px",
          borderRadius: "2px",
          background: "rgba(239,68,68,0.15)",
          overflow: "hidden",
          marginBottom: "1.5rem"
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, #ef4444, #f87171)",
            animation: "shrink 4s linear forwards",
            transformOrigin: "left"
          }} />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            color: "#f87171",
            fontSize: "0.8rem",
            padding: "0.6rem 2rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "var(--font-sans)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.22)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
          }}
        >
          Intentar de nuevo
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

// =====================
// COMPONENTE LOGIN
// =====================
export const Login = () => {
  const { loginAdmin, setCurrentView } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      await loginAdmin(email, password);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al iniciar sesión.");
      setShowErrorPopup(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      {/* Popup de error premium */}
      {showErrorPopup && (
        <ErrorPopup
          message={error}
          onClose={() => setShowErrorPopup(false)}
        />
      )}

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
          style={{ width: "100%", maxWidth: "400px", padding: "3rem 2.5rem" }}
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

            {/* Contraseña con ojo */}
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <KeyRound style={{ width: "12px", height: "12px" }} /> Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0.25rem",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-gold)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                >
                  {showPassword
                    ? <EyeOff style={{ width: "16px", height: "16px" }} />
                    : <Eye style={{ width: "16px", height: "16px" }} />
                  }
                </button>
              </div>
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
    </>
  );
};
