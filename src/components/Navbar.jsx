import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, LayoutDashboard, LogOut, Lock, User, Palette } from "lucide-react";

export const Navbar = () => {
  const { currentView, setCurrentView, user, logoutAdmin, theme, setTheme } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themesList = [
    { id: "emerald", name: "Esmeralda", primary: "#1c352d", accent: "#dfba73" },
    { id: "glass", name: "Liquid Glass", primary: "#00f2fe", accent: "#f35588" },
    { id: "rose", name: "Terciopelo", primary: "#472132", accent: "#e2a893" },
    { id: "sapphire", name: "Zafiro", primary: "#1e2942", accent: "#9cb5db" },
    { id: "onyx", name: "Obsidiana", primary: "#222222", accent: "#c8963e" },
    { id: "amethyst", name: "Amatista", primary: "#140b1e", accent: "#dcaef7" },
    { id: "ruby", name: "Rubí", primary: "#1f090b", accent: "#e89e9b" }
  ];

  // Función para ciclar entre temas secuencialmente con un solo clic
  const cycleTheme = () => {
    const currentIndex = themesList.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % themesList.length;
    setTheme(themesList[nextIndex].id);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsMobileMenuOpen(false);
  };

  // Obtener nombre del tema actual para el tooltip
  const currentThemeName = themesList.find((t) => t.id === theme)?.name || "Esmeralda";

  return (
    <header className={`glass-panel navbar-header ${isScrolled ? "scrolled" : ""}`}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative"
      }}>
        {/* Logo de Lujo: AURUM STUDIO */}
        <div 
          onClick={() => handleViewChange("client")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer"
          }}
        >
          <Sparkles className="text-gold" style={{ width: "22px", height: "22px" }} />
          <span 
            className="text-gold" 
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: "1.4rem",
              letterSpacing: "0.08em"
            }}
          >
            AURUM
          </span>
          <span 
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              marginLeft: "0.2rem",
              borderLeft: "1px solid rgba(255,255,255,0.15)",
              paddingLeft: "0.5rem",
              fontWeight: 600
            }}
          >
            STUDIO
          </span>
        </div>

        {/* --- MENÚ ESCRITORIO --- */}
        <div className="navbar-desktop-menu">
          {/* Icono de Temas que cicla los colores al hacer clic */}
          <button
            onClick={cycleTheme}
            className="btn-secondary"
            style={{
              width: "40px",
              height: "40px",
              padding: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "var(--border-gold)",
              background: "rgba(255, 255, 255, 0.02)"
            }}
            title={`Cambiar Tema (Actual: ${currentThemeName})`}
          >
            <Palette style={{ width: "16px", height: "16px", color: "var(--accent-gold)" }} />
          </button>

          <a 
            href="#catalogo" 
            onClick={() => handleViewChange("client")}
            style={{ 
              color: "var(--text-secondary)", 
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              transition: "var(--transition-fast)"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-gold)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Catálogo
          </a>
          <a 
            href="#contacto" 
            onClick={() => handleViewChange("client")}
            style={{ 
              color: "var(--text-secondary)", 
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              transition: "var(--transition-fast)"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-gold)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Contacto
          </a>

          {user && currentView === "admin" && (
            <span 
              style={{ 
                fontSize: "0.8rem", 
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <User style={{ width: "12px", height: "12px", color: "var(--accent-gold)" }} />
              Admin: <strong style={{ color: "var(--text-primary)" }}>{user?.email}</strong>
            </span>
          )}

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {user ? (
              <>
                {currentView === "client" ? (
                  <button 
                    onClick={() => handleViewChange("admin")}
                    className="btn-outline"
                    style={{ padding: "0.45rem 1.1rem", fontSize: "0.75rem" }}
                  >
                    <LayoutDashboard style={{ width: "12px", height: "12px" }} />
                    Panel Admin
                  </button>
                ) : (
                  <button 
                    onClick={() => handleViewChange("client")}
                    className="btn-outline"
                    style={{ padding: "0.45rem 1.1rem", fontSize: "0.75rem" }}
                  >
                    Ver Sitio Web
                  </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="btn-secondary"
                  style={{ 
                    padding: "0.45rem 0.85rem", 
                    fontSize: "0.75rem",
                    borderRadius: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                  title="Cerrar Sesión"
                >
                  <LogOut style={{ width: "12px", height: "12px" }} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleViewChange("admin")}
                className="btn-secondary"
                style={{ 
                  padding: "0.45rem 1.1rem", 
                  fontSize: "0.75rem",
                  borderRadius: "30px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                <Lock style={{ width: "10px", height: "10px", color: "var(--accent-gold)" }} />
                Admin
              </button>
            )}
          </div>
        </div>

        {/* --- MENÚ MÓVIL TOGGLE --- */}
        <div className="navbar-mobile-toggle">
          <button 
            className={`hamburger-icon ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* --- MENU DESPLEGABLE MÓVIL --- */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {/* Navegación */}
          <a 
            href="#catalogo" 
            onClick={() => handleViewChange("client")}
            style={{ 
              color: "var(--text-primary)", 
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "0.5rem 0"
            }}
          >
            Catálogo
          </a>
          <a 
            href="#contacto" 
            onClick={() => handleViewChange("client")}
            style={{ 
              color: "var(--text-primary)", 
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "0.5rem 0"
            }}
          >
            Contacto
          </a>

          {user && currentView === "admin" && (
            <div style={{ padding: "0.5rem 0", fontSize: "0.9rem" }}>
              <User style={{ width: "14px", height: "14px", color: "var(--accent-gold)", marginRight: "0.4rem", display: "inline" }} />
              Admin: <strong style={{ color: "var(--text-primary)" }}>{user?.email}</strong>
            </div>
          )}

          {/* Temas Móviles (También ciclable o con botón rápido) */}
          <div style={{ 
            borderTop: "1px solid rgba(255,255,255,0.05)", 
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            padding: "1rem 0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)", fontWeight: 600, textTransform: "uppercase" }}>
                Paleta de Temas
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Actual: {currentThemeName}
              </span>
            </div>
            
            <button
              onClick={cycleTheme}
              className="btn-secondary"
              style={{
                width: "100%",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.6rem"
              }}
            >
              <Palette style={{ width: "16px", height: "16px", color: "var(--accent-gold)" }} />
              Presiona para cambiar de tema
            </button>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {user ? (
              <>
                {currentView === "client" ? (
                  <button 
                    onClick={() => handleViewChange("admin")}
                    className="btn-outline"
                    style={{ width: "100%" }}
                  >
                    <LayoutDashboard style={{ width: "14px", height: "14px" }} />
                    Panel Admin
                  </button>
                ) : (
                  <button 
                    onClick={() => handleViewChange("client")}
                    className="btn-outline"
                    style={{ width: "100%" }}
                  >
                    Ver Sitio Web
                  </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <LogOut style={{ width: "14px", height: "14px" }} />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleViewChange("admin")}
                className="btn-gold"
                style={{ width: "100%" }}
              >
                <Lock style={{ width: "12px", height: "12px" }} />
                Acceso Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
