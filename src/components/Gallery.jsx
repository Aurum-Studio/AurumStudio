import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Componente de imagen con collage y animación ───────────────────────────
const DesignCardImage = ({ design, galleryMode }) => {
  // Normalizar imágenes: soporta el array `images` nuevo y el campo `imageUrl` legacy
  const images = design.images && design.images.length > 0
    ? design.images
    : design.imageUrl ? [design.imageUrl] : [];

  const count = images.length;
  const [activeIdx, setActiveIdx] = useState(0);
  const hoverIntervalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Modo hover-carousel: avanza imagen cada 900ms mientras el mouse está sobre la tarjeta
  const startHoverCarousel = useCallback(() => {
    if (count <= 1 || galleryMode !== "hover-carousel") return;
    hoverIntervalRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % count);
    }, 900);
  }, [count, galleryMode]);

  const stopHoverCarousel = useCallback(() => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
    setActiveIdx(0);
  }, []);

  useEffect(() => () => stopHoverCarousel(), [stopHoverCarousel]);

  // Modo click-carousel: avanza imagen con cada click
  const handleClick = (e) => {
    if (count <= 1 || galleryMode !== "click-carousel") return;
    e.stopPropagation();
    setActiveIdx(prev => (prev + 1) % count);
  };

  // ── Layouts de collage ───────────────────────────────────────────────────
  const containerStyle = {
    position: "relative",
    width: "100%",
    paddingBottom: "115%",
    overflow: "hidden",
    background: "#101614",
    cursor: galleryMode === "click-carousel" && count > 1 ? "pointer" : "default"
  };

  // Un solo <img> para el modo static de 1 imagen O para carruseles
  const singleImageMode = count <= 1 || galleryMode === "hover-carousel" || galleryMode === "click-carousel";

  if (singleImageMode) {
    const src = images[activeIdx] || images[0] || "";
    return (
      <div
        style={containerStyle}
        onMouseEnter={() => { setIsHovered(true); startHoverCarousel(); }}
        onMouseLeave={() => { setIsHovered(false); stopHoverCarousel(); }}
        onClick={handleClick}
      >
        <img
          src={src}
          alt={design.title}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease",
            transform: isHovered && galleryMode === "static" ? "scale(1.06)" : "scale(1)",
            userSelect: "none", WebkitUserDrag: "none"
          }}
          onContextMenu={e => e.preventDefault()}
          onDragStart={e => e.preventDefault()}
        />
        {/* Indicador de fotos adicionales */}
        {count > 1 && (
          <div style={{
            position: "absolute", bottom: "0.6rem", right: "0.6rem",
            display: "flex", gap: "4px", zIndex: 3
          }}>
            {images.map((_, i) => (
              <span key={i} style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: i === activeIdx ? "var(--accent-gold)" : "rgba(255,255,255,0.4)",
                transition: "background 0.3s"
              }} />
            ))}
          </div>
        )}
        {/* Badge de categoría */}
        <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 2 }}>
          <span className="category-badge">{design.category}</span>
        </div>
        {/* Hint de click si aplica */}
        {galleryMode === "click-carousel" && count > 1 && (
          <div style={{
            position: "absolute", top: "1rem", right: "1rem", zIndex: 2,
            background: "rgba(0,0,0,0.5)", borderRadius: "20px",
            padding: "0.2rem 0.6rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.8)"
          }}>
            {activeIdx + 1}/{count}
          </div>
        )}
      </div>
    );
  }

  // ── Collage estático (2, 3 o 4 imágenes) ────────────────────────────────
  const collageStyle = {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    display: "grid", gap: "2px"
  };

  const imgStyle = (zoom) => ({
    width: "100%", height: "100%", objectFit: "cover",
    transition: "transform 0.5s ease",
    transform: zoom ? "scale(1.05)" : "scale(1)",
    display: "block"
  });

  const [hoveredCell, setHoveredCell] = useState(null);

  if (count === 2) {
    // Dos columnas iguales
    return (
      <div style={containerStyle}>
        <div style={{ ...collageStyle, gridTemplateColumns: "1fr 1fr" }}>
          {images.slice(0, 2).map((url, i) => (
            <div key={i} style={{ overflow: "hidden" }}
              onMouseEnter={() => setHoveredCell(i)} onMouseLeave={() => setHoveredCell(null)}>
              <img src={url} alt={`${design.title} ${i + 1}`}
                style={imgStyle(hoveredCell === i)}
                onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 2 }}>
          <span className="category-badge">{design.category}</span>
        </div>
      </div>
    );
  }

  if (count === 3) {
    // Grande arriba, dos pequeñas abajo
    return (
      <div style={containerStyle}>
        <div style={{ ...collageStyle, gridTemplateRows: "60% 40%", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1 / -1", overflow: "hidden" }}
            onMouseEnter={() => setHoveredCell(0)} onMouseLeave={() => setHoveredCell(null)}>
            <img src={images[0]} alt={`${design.title} 1`}
              style={imgStyle(hoveredCell === 0)}
              onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
          </div>
          {images.slice(1, 3).map((url, i) => (
            <div key={i} style={{ overflow: "hidden" }}
              onMouseEnter={() => setHoveredCell(i + 1)} onMouseLeave={() => setHoveredCell(null)}>
              <img src={url} alt={`${design.title} ${i + 2}`}
                style={imgStyle(hoveredCell === i + 1)}
                onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 2 }}>
          <span className="category-badge">{design.category}</span>
        </div>
      </div>
    );
  }

  // 4 imágenes → cuadrícula 2×2
  return (
    <div style={containerStyle}>
      <div style={{ ...collageStyle, gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
        {images.slice(0, 4).map((url, i) => (
          <div key={i} style={{ overflow: "hidden" }}
            onMouseEnter={() => setHoveredCell(i)} onMouseLeave={() => setHoveredCell(null)}>
            <img src={url} alt={`${design.title} ${i + 1}`}
              style={imgStyle(hoveredCell === i)}
              onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 2 }}>
        <span className="category-badge">{design.category}</span>
      </div>
    </div>
  );
};
// ─── Fin DesignCardImage ──────────────────────────────────────────────────────

export const Gallery = () => {
  const { designs, setSelectedDesignForOrder, settings } = useApp();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const autoPlayRef = useRef(null);

  // Estados para soportar gestos táctiles (swipe)
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleManualNavigation("next");
    }
    if (isRightSwipe) {
      handleManualNavigation("prev");
    }
  };

  // Obtener categorías basadas en los ajustes configurados del sitio
  const categories = [
    "Todos",
    settings?.category1 || "Gelish / Semi-permanente",
    settings?.category2 || "Nail Art Premium",
    settings?.category3 || "Acrílicas",
    settings?.category4 || "Soft Gel"
  ];

  // Filtrar diseños
  const filteredDesigns = activeCategory === "Todos"
    ? designs
    : designs.filter((d) => d.category === activeCategory);

  const totalItems = filteredDesigns.length;

  // Detectar tamaño de pantalla para ajustar cantidad de elementos visibles en el carrusel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setVisibleItems(1);
      } else if (window.innerWidth <= 768) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reiniciar index al cambiar de categoría
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Lógica de navegación del carrusel infinito/circular
  const maxIndex = Math.max(0, totalItems - visibleItems);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= maxIndex) {
        return 0; // Vuelve al inicio para el ciclo infinito
      }
      return prevIndex + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return maxIndex; // Va al final para el ciclo infinito
      }
      return prevIndex - 1;
    });
  };

  // Autoplay del carrusel
  useEffect(() => {
    // Limpiar intervalo anterior
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    
    // Iniciar nuevo autoplay si hay suficientes elementos para deslizar
    if (totalItems > visibleItems) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 4000); // Cambia cada 4 segundos
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [totalItems, visibleItems, currentIndex]);

  // Detener autoplay al interactuar y reanudar después
  const handleManualNavigation = (direction) => {
    if (direction === "next") {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  // Calcular traducción del track del carrusel en base al ancho de su propio contenedor
  const translation = totalItems > 0 ? -currentIndex * (100 / totalItems) : 0;

  return (
    <section id="catalogo" style={{ padding: "6rem 0", background: "var(--bg-secondary)", position: "relative" }}>
      {/* Luz ambiental de fondo */}
      <div style={{
        position: "absolute",
        bottom: "10%",
        left: "5%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(223, 186, 115, 0.05) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span 
            className="text-gold" 
            style={{ 
              fontSize: "0.8rem", 
              textTransform: "uppercase", 
              letterSpacing: "0.2em",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Sparkles style={{ width: "12px", height: "12px" }} />
            Nuestra Colección
          </span>
          <h2 style={{ fontSize: "2.8rem", marginTop: "0.5rem", fontFamily: "var(--font-serif)" }}>
            Elige tu Estilo
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "550px", margin: "1rem auto 0 auto" }}>
            Explora las creaciones recientes de nuestro estudio en un carrusel interactivo de alta gama. Selecciona el modelo que más te guste para realizar tu pedido.
          </p>
        </div>

        {/* Filtros de Categorías */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "3.5rem"
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                background: activeCategory === category 
                  ? "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-rose) 100%)" 
                  : "rgba(255, 255, 255, 0.02)",
                color: activeCategory === category ? "#0b0f0d" : "var(--text-secondary)",
                border: "1px solid " + (activeCategory === category ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.08)"),
                padding: "0.55rem 1.3rem",
                borderRadius: "30px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "var(--transition-fast)"
              }}
              onMouseOver={(e) => {
                if (activeCategory !== category) {
                  e.target.style.background = "rgba(255, 255, 255, 0.06)";
                  e.target.style.borderColor = "rgba(223, 186, 115, 0.3)";
                }
              }}
              onMouseOut={(e) => {
                if (activeCategory !== category) {
                  e.target.style.background = "rgba(255, 255, 255, 0.02)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* CARRUSEL DE DISEÑOS */}
        {totalItems > 0 ? (
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            
            {/* Botón Izquierda */}
            {totalItems > visibleItems && (
              <button 
                onClick={() => handleManualNavigation("prev")}
                className="carousel-btn carousel-btn-prev"
                aria-label="Anterior"
              >
                <ChevronLeft style={{ width: "24px", height: "24px" }} />
              </button>
            )}

            {/* Viewport del Carrusel */}
            <div 
              className="carousel-viewport"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div 
                className="carousel-track" 
                style={{ 
                  transform: `translateX(${translation}%)`,
                  // Ajustar el ancho del track para que contenga todos los slides con el espacio correcto
                  width: `${(totalItems / visibleItems) * 100}%`
                }}
              >
                {filteredDesigns.map((design) => (
                  <div 
                    key={design.id} 
                    className="carousel-slide" 
                    style={{
                      width: `${100 / totalItems}%`,
                      padding: visibleItems === 3 ? "0.2rem 1rem" : visibleItems === 2 ? "0.2rem 0.75rem" : "0.2rem 0.5rem"
                    }}
                  >
                    <article 
                      className="glass-card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "20px",
                        overflow: "hidden",
                        height: "100%",
                        border: "1px solid rgba(255, 255, 255, 0.08)"
                      }}
                    >
                      {/* Imagen / Collage del Diseño */}
                      <DesignCardImage
                        design={design}
                        galleryMode={settings?.galleryMode || "static"}
                      />

                      {/* Contenido / Textos */}
                      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          marginBottom: "0.5rem"
                        }}>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{design.title}</h3>
                          {design.price && (
                            <span className="text-gold" style={{ 
                              fontFamily: "var(--font-sans)", 
                              fontWeight: 700, 
                              fontSize: "1.1rem" 
                            }}>
                              ${design.price}
                            </span>
                          )}
                        </div>
                        
                        <p style={{ 
                          color: "var(--text-secondary)", 
                          fontSize: "0.85rem",
                          lineHeight: "1.6",
                          marginBottom: "1.5rem",
                          flexGrow: 1
                        }}>
                          {design.description}
                        </p>

                        <button 
                          onClick={() => setSelectedDesignForOrder(design)}
                          className="btn-gold"
                          style={{
                            width: "100%",
                            borderRadius: "10px",
                            padding: "0.75rem",
                            fontSize: "0.8rem",
                            letterSpacing: "0.05em",
                            marginTop: "auto"
                          }}
                        >
                          Pedir este Modelo
                        </button>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Derecha */}
            {totalItems > visibleItems && (
              <button 
                onClick={() => handleManualNavigation("next")}
                className="carousel-btn carousel-btn-next"
                aria-label="Siguiente"
              >
                <ChevronRight style={{ width: "24px", height: "24px" }} />
              </button>
            )}

          </div>
        ) : (
          <div className="glass-panel" style={{
            padding: "4rem 2rem",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
            borderStyle: "dashed"
          }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Aún no hay diseños disponibles en esta categoría.
            </p>
            {activeCategory !== "Todos" && (
              <button 
                onClick={() => setActiveCategory("Todos")}
                className="btn-outline"
                style={{ fontSize: "0.8rem", padding: "0.5rem 1.2rem" }}
              >
                Ver todos los diseños
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
