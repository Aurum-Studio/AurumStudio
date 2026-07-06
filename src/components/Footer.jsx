import React from "react";
import { Sparkles, Phone, MapPin, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

export const Footer = () => {
  const { setCurrentView, settings } = useApp();

  return (
    <footer id="contacto" style={{
      background: "var(--bg-primary)",
      borderTop: "1px solid var(--border-gold)",
      padding: "5rem 0 2rem 0",
      position: "relative"
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr",
          gap: "4rem",
          marginBottom: "4rem"
        }}>
          {/* Logo y Eslogan */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Sparkles className="text-gold" style={{ width: "22px", height: "22px" }} />
              <span className="text-gold" style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "1.3rem",
                letterSpacing: "0.08em"
              }}>
                AURUM STUDIO
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.7", maxWidth: "280px" }}>
              Diseño de uñas de lujo y cuidado personalizado. Creando elegancia y confianza en cada set.
            </p>
          </div>

          {/* Información de Contacto */}
          <div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "1.2rem", fontWeight: 600 }}>Contacto</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Phone style={{ width: "14px", height: "14px", color: "var(--accent-gold)", flexShrink: 0 }} />
                <span>{settings?.contactPhone || "+52 1 234 567 8900"}</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <MapPin style={{ width: "14px", height: "14px", color: "var(--accent-gold)", flexShrink: 0 }} />
                <span>{settings?.contactAddress || "Av. Luxury Gold 789, Colonia Niza, CDMX"}</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Clock style={{ width: "14px", height: "14px", color: "var(--accent-gold)", flexShrink: 0 }} />
                <span>{settings?.contactHours || "Lunes a Sábado: 10:00 AM - 8:00 PM"}</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociales y Administración */}
          <div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "1.2rem", fontWeight: 600 }}>Redes Sociales</h4>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <a href={settings?.instagramUrl || "#"} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", transition: "var(--transition-fast)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-gold)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href={settings?.facebookUrl || "#"} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", transition: "var(--transition-fast)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-gold)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
            
            <button 
              onClick={() => {
                setCurrentView("admin");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0
              }}
              onMouseOver={(e) => e.target.style.color = "var(--accent-gold)"}
              onMouseOut={(e) => e.target.style.color = "var(--text-muted)"}
            >
              Acceso Administradora
            </button>
          </div>
        </div>

        {/* Derechos Reservados */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)"
        }}>
          &copy; {new Date().getFullYear()} Aurum Studio. Todos los derechos reservados. Diseñado para la excelencia.
        </div>
      </div>
    </footer>
  );
};
