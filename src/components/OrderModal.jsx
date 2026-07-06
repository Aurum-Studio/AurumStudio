import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Check, Calendar, Phone, User, MessageCircle, FileText } from "lucide-react";

export const OrderModal = () => {
  const { selectedDesignForOrder, setSelectedDesignForOrder, placeOrder, settings } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!selectedDesignForOrder) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Por favor rellena el Nombre y Teléfono.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Guardar el pedido en base de datos
      await placeOrder({
        clientName: formData.name,
        clientPhone: formData.phone,
        preferredDate: formData.date,
        clientNotes: formData.notes
      });

      // Crear enlace de WhatsApp para enviar el pedido al admin
      const adminWhatsAppNumber = settings?.whatsappNumber || "521234567890"; // Reemplazar con el número del salón si es necesario, o dejar configurable.
      const dateText = formData.date ? `📆 Fecha/Hora deseada: ${formData.date}\n` : "";
      const notesText = formData.notes ? `📝 Notas adicionales: ${formData.notes}\n` : "";
      
      const message = 
        `✨ *NUEVA SOLICITUD DE DISEÑO - AURUM STUDIO* ✨\n\n` +
        `Me ha encantado el siguiente modelo para mis uñas:\n` +
        `💅 *Diseño:* ${selectedDesignForOrder.title}\n` +
        `🏷️ *Categoría:* ${selectedDesignForOrder.category}\n` +
        `💵 *Precio aproximado:* $${selectedDesignForOrder.price || "Cotizar"}\n\n` +
        `👤 *Mis Datos de Contacto:*\n` +
        `- Nombre: ${formData.name}\n` +
        `- Teléfono: ${formData.phone}\n` +
        dateText +
        notesText +
        `🔗 *Ver diseño de referencia:* ${selectedDesignForOrder.imageUrl}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsAppLink = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;

      // Mostrar pantalla de éxito y abrir WhatsApp
      setIsSuccess(true);
      setTimeout(() => {
        window.open(whatsAppLink, "_blank");
      }, 1500);

    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(11, 15, 13, 0.8)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div 
        className="glass-panel-gold fade-in order-modal-card"
        style={{
          position: "relative",
          borderWidth: "1px",
          padding: 0
        }}
      >
        {/* Lado Izquierdo: Resumen del Modelo Elegido */}
        <div style={{
          position: "relative",
          height: "100%",
          minHeight: "350px",
          overflow: "hidden",
          background: "var(--bg-secondary)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end"
        }}>
          <img 
            src={selectedDesignForOrder.imageUrl} 
            alt={selectedDesignForOrder.title} 
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.8,
              userSelect: "none",
              WebkitUserDrag: "none"
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, rgba(11, 15, 13, 0.95) 20%, rgba(11, 15, 13, 0.4) 60%, rgba(0,0,0,0) 100%)",
            zIndex: 1
          }} />

          {/* Botón Cerrar (en móvil o arriba a la izquierda) */}
          <button 
            onClick={() => setSelectedDesignForOrder(null)}
            style={{
              position: "absolute",
              top: "1.25rem",
              left: "1.25rem",
              background: "rgba(11, 15, 13, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              zIndex: 10
            }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>

          <div style={{ position: "relative", zIndex: 2, padding: "2rem" }}>
            <span className="category-badge" style={{ marginBottom: "0.75rem" }}>
              {selectedDesignForOrder.category}
            </span>
            <h3 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{selectedDesignForOrder.title}</h3>
            {selectedDesignForOrder.price && (
              <p className="text-gold" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                ${selectedDesignForOrder.price}
              </p>
            )}
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6" }}>
              {selectedDesignForOrder.description}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div style={{ padding: "2.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {!isSuccess ? (
            <>
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Completa tu Solicitud</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Ingresa tus datos para agendar o cotizar. Te redirigiremos a WhatsApp para confirmar los detalles.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                {/* Nombre */}
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <User style={{ width: "12px", height: "12px" }} /> Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="form-input"
                  />
                </div>

                {/* Teléfono */}
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Phone style={{ width: "12px", height: "12px" }} /> Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej. +52 1 234 5678"
                    className="form-input"
                  />
                </div>

                {/* Fecha Sugerida */}
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Calendar style={{ width: "12px", height: "12px" }} /> Fecha/Hora Sugerida
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                {/* Notas */}
                <div className="form-group" style={{ marginBottom: "2rem" }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FileText style={{ width: "12px", height: "12px" }} /> Especificaciones / Notas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Largo, forma de uña, cambio de color, etc..."
                    className="form-input"
                    rows="3"
                    style={{ resize: "none" }}
                  />
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  <MessageCircle style={{ width: "18px", height: "18px" }} />
                  {isSubmitting ? "Enviando..." : "Confirmar por WhatsApp"}
                </button>
              </form>
            </>
          ) : (
            <div style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%"
            }}>
              <div 
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(223, 186, 115, 0.15)",
                  border: "2px solid var(--accent-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-gold)",
                  marginBottom: "1.5rem"
                }}
              >
                <Check style={{ width: "28px", height: "28px" }} />
              </div>
              <h4 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>¡Solicitud Registrada!</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "250px", margin: "0 auto" }}>
                Tu selección se ha guardado en nuestro panel. Abriendo WhatsApp para coordinar tu cita...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
