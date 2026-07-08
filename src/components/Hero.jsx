import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export const Hero = () => {
  const { settings, setCurrentView } = useApp();
  return (
    <section className="hero-section" style={{
      padding: "4rem 0 3rem 0",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Círculo luminoso de fondo (luz ambiental esmeralda) */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "5%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(28, 53, 45, 0.2) 0%, rgba(11, 15, 13, 0) 70%)",
        zIndex: -1,
        pointerEvents: "none"
      }} />

      <div className="container hero-grid">
        {/* Lado Izquierdo: Textos */}
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(223, 186, 115, 0.06)",
            border: "1px solid rgba(223, 186, 115, 0.15)",
            padding: "0.4rem 1rem",
            borderRadius: "20px",
            marginBottom: "1.5rem"
          }}>
            <Sparkles style={{ width: "12px", height: "12px", color: "var(--accent-gold)" }} />
            <span style={{ 
              fontSize: "0.75rem", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em",
              color: "var(--accent-gold)",
              fontWeight: 600
            }}>
              Estilo y Alta Costura en Uñas
            </span>
          </div>

          <h1 className="hero-title" style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400
          }}>
            {settings?.heroTitle || "Diseños que cautivan"}
          </h1>

          <p style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            lineHeight: "1.7",
            marginBottom: "2.5rem",
            maxWidth: "480px"
          }}>
            {settings?.heroSubtitle || "En Aurum Studio transformamos tus manos en una obra de arte. Diseños premium personalizados, materiales de la más alta calidad y un cuidado meticuloso para un acabado deslumbrante."}
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button 
              onClick={() => setCurrentView("cotizador")} 
              className="btn-gold"
              style={{ display: "inline-flex", gap: "0.5rem", border: "none" }}
            >
              Cotizar Uñas
              <Sparkles style={{ width: "16px", height: "16px", strokeWidth: 2.5 }} />
            </button>
            <a href="#catalogo" className="btn-outline" style={{ textDecoration: "none" }}>
              Explorar Catálogo
            </a>
          </div>
        </div>

        {/* Lado Derecho: Composición de Imágenes (Mosaico Editorial) */}
        <div className="fade-in hero-mosaic" style={{ animationDelay: "0.3s" }}>
          {/* Imagen Principal */}
          <div 
            className="glass-panel-gold hero-float-1" 
            style={{
              width: "280px",
              height: "370px",
              overflow: "hidden",
              borderRadius: "24px",
              zIndex: 2,
              position: "relative"
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80" 
              alt="Nail Art Elegante" 
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "var(--transition-premium)"
              }}
              onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.target.style.transform = "scale(1)"}
            />
          </div>

          {/* Imagen Secundaria Flotante */}
          <div 
            className="glass-panel hero-float-2" 
            style={{
              width: "180px",
              height: "200px",
              overflow: "hidden",
              borderRadius: "16px",
              position: "absolute",
              bottom: "10px",
              right: "20px",
              zIndex: 3,
              border: "1px solid rgba(223, 186, 115, 0.3)"
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=600&q=80" 
              alt="Nail Detail" 
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "var(--transition-premium)"
              }}
              onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.target.style.transform = "scale(1)"}
            />
          </div>

          {/* Tarjeta de Reseña de Lujo */}
          <div 
            className="glass-panel" 
            style={{
              padding: "1rem",
              borderRadius: "16px",
              position: "absolute",
              top: "30px",
              left: "-10px",
              zIndex: 4,
              maxWidth: "180px",
              transform: "translateY(-10px)"
            }}
          >
            <div style={{ display: "flex", gap: "0.2rem", marginBottom: "0.4rem" }}>
              {"★★★★★".split("").map((star, i) => (
                <span key={i} style={{ color: "var(--accent-gold)", fontSize: "0.75rem" }}>{star}</span>
              ))}
            </div>
            <p style={{ fontSize: "0.7rem", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              "El set Emerald Velvet que me hice es espectacular. Recibí cumplidos toda la semana."
            </p>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, marginTop: "0.4rem", color: "var(--accent-gold)" }}>
              — Sofia R.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
