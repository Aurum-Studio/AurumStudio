import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Sparkles, Check, Plus, Minus, RotateCcw, MessageCircle, 
  X, Calendar, Phone, User, FileText, ChevronRight, Info 
} from "lucide-react";

// Lista de técnicas base y precios
const BASE_SERVICES = [
  // Soft Gel
  { id: "sg-corto", name: "Soft gel corto (#0)", price: 180, group: "softgel", desc: "Incluye 1 tono liso" },
  { id: "sg-mediano", name: "Soft gel mediano (#1–#2)", price: 200, group: "softgel", desc: "Incluye 1 tono liso" },
  { id: "sg-largo", name: "Soft gel largo (#3–#4)", price: 250, group: "softgel", desc: "Incluye 1 tono liso" },
  { id: "sg-xl", name: "Soft gel XL (#5)", price: 300, group: "softgel", desc: "Incluye 1 tono liso" },
  // Gel Semipermanente
  { id: "gel-1", name: "Gel 1 tono liso", price: 130, group: "gel", desc: "Incluye los tonos lisos" },
  { id: "gel-2", name: "Gel 2 tonos lisos", price: 150, group: "gel", desc: "Incluye los tonos lisos" },
  // Press On
  { id: "presson-10", name: "Set de 10 uñas Press On", price: 190, group: "presson", desc: "Incluye 2 tonos lisos" }
];

// Extras condicionales por grupo de técnica
const GROUP_EXTRAS = {
  gel: [
    { id: "rubber", name: "Recubrimiento con rubber", price: 20 },
    { id: "pies", name: "Aplicación en pies", price: 15 }
  ],
  presson: [
    { id: "kit", name: "Kit de aplicación", price: 25 },
    { id: "pegamento", name: "Pegamento extra", price: 13 },
    { id: "cepillo", name: "Cepillo para uñas", price: 5 }
  ]
};

// Adicionales generales del servicio
const GENERAL_EXTRAS = [
  { id: "desechables", name: "Uso de desechables", price: 12 },
  { id: "cambio-forma", name: "Cambio de forma", price: 10 },
  { id: "retiro", name: "Retiro de producto previo", price: 20 }
];

// Decoraciones divididas por categorías
const DECORATIONS_BY_CATEGORY = {
  efectos: {
    title: "Efectos & Brillos",
    items: [
      { id: "deco-2", name: "Pegatina dorado/plateado", price: 0.50 },
      { id: "deco-1", name: "Pegatina gothic", price: 1.00 },
      { id: "deco-3", name: "Efecto Espejo", price: 3.00 },
      { id: "deco-4", name: "Efecto Aurora", price: 3.00 },
      { id: "deco-8", name: "Efecto Blooming", price: 3.00 },
      { id: "deco-9", name: "Cat Eye", price: 3.00 },
      { id: "deco-21", name: "Glitter", price: 3.00 },
      { id: "deco-7", name: "Efecto Carey", price: 5.00 },
      { id: "deco-20", name: "Decoración disco", price: 5.00 }
    ]
  },
  relieves: {
    title: "Relieves & Pedrería",
    items: [
      { id: "deco-10", name: "Relieve 2D", price: 3.00 },
      { id: "deco-11", name: "3D Premium", price: 5.00 },
      { id: "deco-6", name: "Perlas", price: 5.00 },
      { id: "deco-15", name: "Cristales", price: 5.00 },
      { id: "deco-17", name: "Balines", price: 5.00 },
      { id: "deco-18", name: "Charm", price: 5.00 },
      { id: "deco-16", name: "Uña completa de cristal", price: 25.00 }
    ]
  },
  diseno: {
    title: "Arte & Diseños",
    items: [
      { id: "deco-12", name: "Estilo Francés", price: 3.00 },
      { id: "deco-5", name: "Efecto Suéter", price: 5.00 },
      { id: "deco-19", name: "Efecto Aura", price: 5.00 },
      { id: "deco-13", name: "Nail Art Simple", price: 5.00 },
      { id: "deco-14", name: "Nail Art Avanzado", price: 10.00 }
    ]
  }
};

export const Cotizador = () => {
  const { settings, setCurrentView, placeCustomOrder } = useApp();
  
  // Estados de Selección
  const [selectedBase, setSelectedBase] = useState(null);
  const [checkedExtras, setCheckedExtras] = useState({});
  const [tonosExtraCount, setTonosExtraCount] = useState(0);
  const [decorationsCount, setDecorationsCount] = useState({});
  const [discountVal, setDiscountVal] = useState("");
  
  // Navegación interna (Pestaña de decoración activa)
  const [activeDecoTab, setActiveDecoTab] = useState("efectos");
  
  // Estado del Modal de Checkout / Envío
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Al cambiar la técnica base, limpiar los extras de técnicas anteriores
  useEffect(() => {
    if (selectedBase) {
      const activeGroup = selectedBase.group;
      const updatedExtras = { ...checkedExtras };
      // Limpiar extras de gel si no es gel
      if (activeGroup !== "gel") {
        updatedExtras["rubber"] = false;
        updatedExtras["pies"] = false;
      }
      // Limpiar extras de presson si no es presson
      if (activeGroup !== "presson") {
        updatedExtras["kit"] = false;
        updatedExtras["pegamento"] = false;
        updatedExtras["cepillo"] = false;
      }
      setCheckedExtras(updatedExtras);
    }
  }, [selectedBase]);

  // Cálculos de precios en tiempo real
  const calculateTotal = () => {
    let total = 0;
    const items = [];

    // 1. Técnica Base
    if (selectedBase) {
      total += selectedBase.price;
      items.push({ name: selectedBase.name, price: selectedBase.price });

      // 2. Extras Condicionales
      const groupExtrasList = GROUP_EXTRAS[selectedBase.group] || [];
      groupExtrasList.forEach((extra) => {
        if (checkedExtras[extra.id]) {
          total += extra.price;
          items.push({ name: extra.name, price: extra.price });
        }
      });
    }

    // 3. Adicionales Generales
    GENERAL_EXTRAS.forEach((extra) => {
      if (checkedExtras[extra.id]) {
        total += extra.price;
        items.push({ name: extra.name, price: extra.price });
      }
    });

    // 4. Tonos Extra
    if (tonosExtraCount > 0) {
      const price = tonosExtraCount * 5;
      total += price;
      items.push({ name: `Tonos extra ×${tonosExtraCount}`, price });
    }

    // 5. Decoraciones
    Object.keys(decorationsCount).forEach((decoId) => {
      const qty = decorationsCount[decoId];
      if (qty > 0) {
        // Encontrar objeto decoración
        let decorationItem = null;
        Object.keys(DECORATIONS_BY_CATEGORY).forEach((cat) => {
          const found = DECORATIONS_BY_CATEGORY[cat].items.find(item => item.id === decoId);
          if (found) decorationItem = found;
        });

        if (decorationItem) {
          const price = decorationItem.price * qty;
          total += price;
          items.push({ name: `${decorationItem.name} (×${qty})`, price });
        }
      }
    });

    // 6. Descuento
    const discount = parseFloat(discountVal) || 0;
    if (discount > 0) {
      total -= discount;
      items.push({ name: "Descuento", price: -discount });
    }

    if (total < 0) total = 0;

    return { total, items };
  };

  const { total, items: breakdownItems } = calculateTotal();

  // Reiniciar todo el cotizador
  const handleReset = () => {
    if (window.confirm("¿Seguro que quieres reiniciar la cotización?")) {
      setSelectedBase(null);
      setCheckedExtras({});
      setTonosExtraCount(0);
      setDecorationsCount({});
      setDiscountVal("");
      setIsMobileSummaryOpen(false);
    }
  };

  // Manejar cambios de contadores de decoración
  const updateDecoQty = (id, change) => {
    setDecorationsCount((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + change);
      return { ...prev, [id]: next };
    });
  };

  // Manejar cambios de datos del formulario de envío
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar pedido y generar WhatsApp
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Por favor ingresa tu Nombre y Teléfono.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Guardar en Base de Datos como orden pendiente
      const orderDetailsText = breakdownItems
        .filter(item => item.name !== "Descuento")
        .map(item => `${item.name} ($${item.price})`)
        .join(", ");

      await placeCustomOrder({
        clientName: formData.name,
        clientPhone: formData.phone,
        preferredDate: formData.date || "No especificada",
        clientNotes: formData.notes,
        designTitle: `Cotización Personalizada: ${selectedBase?.name || "Sin base"}`,
        designPrice: total,
        designImage: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=300&q=80", // Imagen genérica
        orderDetails: orderDetailsText
      });

      // 2. Compilar Mensaje de WhatsApp
      const adminWhatsAppNumber = settings?.whatsappNumber || "521234567890";
      
      let breakdownText = "";
      breakdownItems.forEach((item) => {
        const valStr = item.price < 0 ? `- $${Math.abs(item.price)}` : `$${item.price}`;
        breakdownText += `• ${item.name}: *${valStr}*\n`;
      });

      const message = 
        `✨ *NUEVA COTIZACIÓN PERSONALIZADA - AURUM STUDIO* ✨\n\n` +
        `¡Hola! He armado una cotización personalizada en la web:\n\n` +
        `📝 *Conceptos de Servicio:*\n` +
        breakdownText +
        `\n💵 *Total Estimado: $${total.toFixed(2)}*\n\n` +
        `👤 *Datos de Contacto:*\n` +
        `- Nombre: ${formData.name}\n` +
        `- Teléfono: ${formData.phone}\n` +
        (formData.date ? `- Fecha sugerida: ${formData.date}\n` : "") +
        (formData.notes ? `- Notas adicionales: ${formData.notes}\n` : "") +
        `\n_Favor de confirmar disponibilidad para agendar. ¡Gracias!_`;

      const encodedMessage = encodeURIComponent(message);
      const whatsAppLink = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;

      setIsSuccess(true);
      setTimeout(() => {
        window.open(whatsAppLink, "_blank");
        // Cerrar modal y redirigir
        setIsCheckoutOpen(false);
        setIsSuccess(false);
        setFormData({ name: "", phone: "", date: "", notes: "" });
        setCurrentView("client");
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Hubo un error al registrar tu cotización. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: "6rem" }}>
      {/* Botón Volver */}
      <div style={{ marginBottom: "2rem" }}>
        <button 
          onClick={() => setCurrentView("client")}
          className="btn-secondary"
          style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "12px" }}
        >
          ← Volver al Sitio
        </button>
      </div>

      {/* Título de la Sección */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(223, 186, 115, 0.06)",
          border: "1px solid rgba(223, 186, 115, 0.15)",
          padding: "0.4rem 1rem",
          borderRadius: "20px",
          marginBottom: "1rem"
        }}>
          <Sparkles style={{ width: "12px", height: "12px", color: "var(--accent-gold)" }} />
          <span style={{ 
            fontSize: "0.75rem", 
            textTransform: "uppercase", 
            letterSpacing: "0.15em",
            color: "var(--accent-gold)",
            fontWeight: 600
          }}>
            Cotizador Interactivo
          </span>
        </div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 400, fontFamily: "var(--font-serif)", marginBottom: "0.5rem" }}>
          Diseña tu Set a la Medida
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
          Selecciona tu técnica base, los adicionales del servicio y las decoraciones por uña. Obtén el costo exacto al instante y envíalo para agendar cita.
        </p>
      </div>

      {/* Layout Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "2rem",
        alignItems: "start",
        position: "relative"
      }} className="lg-grid-layout-cotizador">
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 1024px) {
            .lg-grid-layout-cotizador {
              grid-template-columns: 2fr 1fr !important;
            }
          }
          .option-card-touch {
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 16px;
            padding: 1.2rem;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: var(--transition-fast);
            min-height: 100px;
            position: relative;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .option-card-touch:hover {
            border-color: rgba(223, 186, 115, 0.5);
          }
          .option-card-touch.selected {
            border-color: var(--accent-gold);
            background: rgba(223, 186, 115, 0.04);
            box-shadow: var(--shadow-gold-glow);
          }
          .qty-btn-premium {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.03);
            border: 1.5px solid var(--border-gold);
            color: var(--accent-gold);
            cursor: pointer;
            transition: var(--transition-fast);
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .qty-btn-premium:active {
            transform: scale(0.9);
            background: var(--accent-gold);
            color: var(--bg-primary);
          }
          .qty-btn-premium:hover {
            background: rgba(223, 186, 115, 0.1);
          }
          .deco-tab-btn {
            padding: 0.8rem 1.2rem;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 0.85rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: var(--transition-fast);
          }
          .deco-tab-btn.active {
            color: var(--accent-gold);
            border-bottom-color: var(--accent-gold);
          }
        `}} />

        {/* LADO IZQUIERDO: SELECCIONES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* PASO 1: Técnica Base */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--accent-gold)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-gold)", color: "var(--bg-primary)", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>1</span>
              Elige tu Técnica Base y Largo
            </h3>

            {/* Subgrupos de técnicas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Soft Gel */}
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.8rem" }}>Soft Gel</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {BASE_SERVICES.filter(s => s.group === "softgel").map((service) => (
                    <div 
                      key={service.id} 
                      onClick={() => setSelectedBase(service)}
                      className={`option-card-touch ${selectedBase?.id === service.id ? "selected" : ""}`}
                    >
                      <div style={{ display: "flex", justifyViewport: "space-between", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 600, maxWidth: "75%" }}>{service.name}</span>
                        {selectedBase?.id === service.id && <Check style={{ width: "16px", height: "16px", color: "var(--accent-gold)" }} />}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>{service.desc}</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)" }}>${service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gel Semipermanente */}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.8rem" }}>Gel Semipermanente</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {BASE_SERVICES.filter(s => s.group === "gel").map((service) => (
                    <div 
                      key={service.id} 
                      onClick={() => setSelectedBase(service)}
                      className={`option-card-touch ${selectedBase?.id === service.id ? "selected" : ""}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 600, maxWidth: "75%" }}>{service.name}</span>
                        {selectedBase?.id === service.id && <Check style={{ width: "16px", height: "16px", color: "var(--accent-gold)" }} />}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>{service.desc}</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)" }}>${service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Press On */}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.8rem" }}>Press On</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {BASE_SERVICES.filter(s => s.group === "presson").map((service) => (
                    <div 
                      key={service.id} 
                      onClick={() => setSelectedBase(service)}
                      className={`option-card-touch ${selectedBase?.id === service.id ? "selected" : ""}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 600, maxWidth: "75%" }}>{service.name}</span>
                        {selectedBase?.id === service.id && <Check style={{ width: "16px", height: "16px", color: "var(--accent-gold)" }} />}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>{service.desc}</span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)" }}>${service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* PASO 2: Adicionales del Servicio */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--accent-gold)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-gold)", color: "var(--bg-primary)", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>2</span>
              Adicionales y Extras
            </h3>

            {/* Mensaje Informativo si no hay base seleccionada */}
            {!selectedBase && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border-gold)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
                <Info style={{ width: "18px", height: "18px", color: "var(--accent-gold)", flexShrink: 0 }} />
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Selecciona una técnica base en el paso 1 para habilitar sus opciones adicionales específicas.
                </p>
              </div>
            )}

            {/* Extras condicionales (Gel o Press On) */}
            {selectedBase && (selectedBase.group === "gel" || selectedBase.group === "presson") && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.8rem" }}>
                  Adicionales para {selectedBase.group === "gel" ? "Gel Semipermanente" : "Press On"}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {GROUP_EXTRAS[selectedBase.group].map((extra) => (
                    <div 
                      key={extra.id}
                      onClick={() => setCheckedExtras(prev => ({ ...prev, [extra.id]: !prev[extra.id] }))}
                      className={`option-card-touch ${checkedExtras[extra.id] ? "selected" : ""}`}
                      style={{ minHeight: "80px", padding: "1rem" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 500, maxWidth: "80%" }}>{extra.name}</span>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "6px",
                          border: "1.5px solid var(--border-gold)",
                          background: checkedExtras[extra.id] ? "var(--accent-gold)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--bg-primary)"
                        }}>
                          {checkedExtras[extra.id] && <Check style={{ width: "12px", height: "12px", strokeWidth: 3 }} />}
                        </div>
                      </div>
                      <div style={{ marginTop: "0.4rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                        +${extra.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extras Generales globales */}
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.8rem" }}>
                Extras generales del servicio
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {GENERAL_EXTRAS.map((extra) => (
                  <div 
                    key={extra.id}
                    onClick={() => setCheckedExtras(prev => ({ ...prev, [extra.id]: !prev[extra.id] }))}
                    className={`option-card-touch ${checkedExtras[extra.id] ? "selected" : ""}`}
                    style={{ minHeight: "80px", padding: "1rem" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 500, maxWidth: "80%" }}>{extra.name}</span>
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: "1.5px solid var(--border-gold)",
                        background: checkedExtras[extra.id] ? "var(--accent-gold)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--bg-primary)"
                      }}>
                        {checkedExtras[extra.id] && <Check style={{ width: "12px", height: "12px", strokeWidth: 3 }} />}
                      </div>
                    </div>
                    <div style={{ marginTop: "0.4rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                      +${extra.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* PASO 3: Tonos Extra */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--accent-gold)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-gold)", color: "var(--bg-primary)", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>3</span>
              Tonos de Esmalte Extra
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Además de los tonos ya incluidos en tu técnica base, agrega tonos extra por **$5 c/u**.
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "1rem 1.5rem"
            }}>
              <div>
                <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Agregar tonos adicionales</span>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>+$5.00 por cada tono extra</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button 
                  onClick={() => setTonosExtraCount(prev => Math.max(0, prev - 1))}
                  className="qty-btn-premium"
                  disabled={tonosExtraCount === 0}
                  aria-label="Restar tono"
                >
                  <Minus style={{ width: "16px", height: "16px" }} />
                </button>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, minWidth: "1.5rem", textAlign: "center", color: "var(--accent-gold)" }}>
                  {tonosExtraCount}
                </span>
                <button 
                  onClick={() => setTonosExtraCount(prev => prev + 1)}
                  className="qty-btn-premium"
                  aria-label="Sumar tono"
                >
                  <Plus style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </div>
          </div>

          {/* PASO 4: Decoraciones (Agrupadas en Pestañas Táctiles) */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--accent-gold)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-gold)", color: "var(--bg-primary)", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>4</span>
              Decoraciones por Uña y Diseño
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Elige el tipo de diseño y la cantidad de uñas decoradas. El costo indicado es **por cada uña**.
            </p>

            {/* Pestañas de categoría de decoración */}
            <div style={{ 
              display: "flex", 
              borderBottom: "1px solid var(--border-light)", 
              marginBottom: "1.5rem",
              overflowX: "auto"
            }} className="admin-tabs">
              {Object.keys(DECORATIONS_BY_CATEGORY).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setActiveDecoTab(catKey)}
                  className={`deco-tab-btn ${activeDecoTab === catKey ? "active" : ""}`}
                >
                  {DECORATIONS_BY_CATEGORY[catKey].title}
                </button>
              ))}
            </div>

            {/* Grid de Decoraciones de la pestaña activa */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {DECORATIONS_BY_CATEGORY[activeDecoTab].items.map((deco) => {
                const qty = decorationsCount[deco.id] || 0;
                return (
                  <div 
                    key={deco.id}
                    className={`option-card-touch ${qty > 0 ? "selected" : ""}`}
                    style={{ 
                      padding: "1rem", 
                      minHeight: "80px", 
                      display: "flex", 
                      flexDirection: "row", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      cursor: "default"
                    }}
                  >
                    <div style={{ maxWidth: "60%" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{deco.name}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-gold)", marginTop: "0.2rem" }}>
                        ${deco.price.toFixed(2)} <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>c/u</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <button 
                        onClick={() => updateDecoQty(deco.id, -1)}
                        className="qty-btn-premium"
                        style={{ width: "32px", height: "32px" }}
                        disabled={qty === 0}
                      >
                        <Minus style={{ width: "12px", height: "12px" }} />
                      </button>
                      <span style={{ fontSize: "1rem", fontWeight: 700, minWidth: "1.2rem", textAlign: "center", color: qty > 0 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                        {qty}
                      </span>
                      <button 
                        onClick={() => updateDecoQty(deco.id, 1)}
                        className="qty-btn-premium"
                        style={{ width: "32px", height: "32px" }}
                        disabled={qty >= 10} // Límite de 10 uñas
                      >
                        <Plus style={{ width: "12px", height: "12px" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PASO 5: Descuento */}
          <div className="glass-card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--accent-gold)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ display: "inline-flex", width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-gold)", color: "var(--bg-primary)", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>5</span>
              Descuento (Opcional)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Si tienes algún cupón o descuento acordado, ingresa la cantidad a restar del total del servicio:
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-gold)" }}>$</span>
              <input 
                type="number" 
                min="0"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                placeholder="Cantidad a restar"
                className="form-input"
                style={{ width: "180px" }}
              />
            </div>
          </div>

        </div>

        {/* LADO DERECHO: TARJETA DE RESUMEN FIJA */}
        <div>
          <div className="glass-panel-gold" style={{ padding: "2rem", position: "sticky", top: "8.5rem" }}>
            <h3 style={{ 
              fontSize: "1.4rem", 
              fontFamily: "var(--font-serif)", 
              color: "var(--accent-gold)", 
              textAlign: "center", 
              marginBottom: "1.5rem",
              borderBottom: "1px solid var(--border-gold)",
              paddingBottom: "0.8rem"
            }}>
              Resumen de Cotización ✨
            </h3>

            {/* Listado de conceptos */}
            <div style={{ 
              maxHeight: "300px", 
              overflowY: "auto", 
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              paddingRight: "0.3rem"
            }}>
              {breakdownItems.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", padding: "2rem 0" }}>
                  Selecciona una técnica base para iniciar la cotización...
                </div>
              ) : (
                breakdownItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", maxWidth: "75%" }}>{item.name}</span>
                    <span style={{ 
                      fontWeight: 600, 
                      color: item.price < 0 ? "rgba(244, 63, 94, 0.95)" : "var(--text-primary)" 
                    }}>
                      {item.price < 0 ? `- $${Math.abs(item.price)}` : `$${item.price.toFixed(2)}`}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div style={{ 
              borderTop: "1.5px solid var(--border-gold)", 
              paddingTop: "1.2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem"
            }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Total Estimado:</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent-gold)", textShadow: "0 0 10px rgba(223,186,115,0.15)" }}>
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Botones de acción */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                disabled={!selectedBase}
                className="btn-gold"
                style={{ width: "100%", opacity: selectedBase ? 1 : 0.6 }}
              >
                Enviar y Solicitar Cita
              </button>
              <button 
                onClick={handleReset}
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <RotateCcw style={{ width: "14px", height: "14px" }} />
                Reiniciar Cotización
              </button>
            </div>

            {/* Nota aclaratoria */}
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1rem", lineHeight: "1.4" }}>
              * Los precios son referenciales. Cualquier diseño adicional complejo podría ajustar el costo final en el salón.
            </p>
          </div>
        </div>

      </div>

      {/* BARRA INFERIOR PERSISTENTE (MÓVIL) */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "rgba(6, 9, 7, 0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1.5px solid var(--border-gold)",
        padding: "1rem 1.5rem",
        zIndex: 90,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.5)"
      }} className="mobile-only-action-bar">
        <style dangerouslySetInnerHTML={{__html: `
          .mobile-only-action-bar { display: flex !important; }
          @media (min-width: 1024px) {
            .mobile-only-action-bar { display: none !important; }
          }
        `}} />
        <div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Estimado</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-gold)" }} onClick={() => setIsMobileSummaryOpen(true)}>
            ${total.toFixed(2)} <span style={{ fontSize: "0.75rem", color: "var(--accent-gold-hover)", textDecoration: "underline", marginLeft: "0.2rem", fontWeight: 400 }}>ver detalles</span>
          </div>
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          disabled={!selectedBase}
          className="btn-gold"
          style={{ padding: "0.75rem 1.5rem", fontSize: "0.8rem", width: "auto", opacity: selectedBase ? 1 : 0.6 }}
        >
          Enviar Cita
        </button>
      </div>

      {/* MODAL DE RESUMEN MÓVIL DESPLEGABLE */}
      {isMobileSummaryOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 999,
          display: "flex",
          alignItems: "flex-end"
        }}>
          <div className="glass-panel-gold fade-in" style={{ width: "100%", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: "2rem", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-gold)", paddingBottom: "0.8rem" }}>
              <h4 style={{ fontSize: "1.2rem", color: "var(--accent-gold)" }}>Desglose de Cotización</h4>
              <button onClick={() => setIsMobileSummaryOpen(false)} style={{ background: "none", border: "none", color: "white" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {breakdownItems.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>No hay elementos seleccionados.</div>
              ) : (
                breakdownItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                    <span style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: "1.5px solid var(--border-gold)", paddingTop: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Total:</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent-gold)" }}>${total.toFixed(2)}</span>
            </div>

            <button onClick={() => setIsMobileSummaryOpen(false)} className="btn-gold" style={{ width: "100%" }}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT / DETALLES CLIENTE */}
      {isCheckoutOpen && (
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
            className="glass-panel-gold fade-in"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              padding: "2.5rem 2rem",
              boxShadow: "var(--shadow-luxury)"
            }}
          >
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white"
              }}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>

            {!isSuccess ? (
              <>
                <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                  <h4 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", fontFamily: "var(--font-serif)" }}>Confirmar Cotización</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Ingresa tus datos para registrar tu solicitud. Te redirigiremos a WhatsApp para finalizar la coordinación.
                  </p>
                </div>

                <form onSubmit={handleCheckoutSubmit} style={{ display: "flex", flexDirection: "column" }}>
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
                      onChange={handleFormChange}
                      placeholder="Ej. María López"
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
                      onChange={handleFormChange}
                      placeholder="Ej. 5512345678"
                      className="form-input"
                    />
                  </div>

                  {/* Fecha Sugerida */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar style={{ width: "12px", height: "12px" }} /> Fecha Sugerida (Opcional)
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>

                  {/* Notas */}
                  <div className="form-group" style={{ marginBottom: "2rem" }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <FileText style={{ width: "12px", height: "12px" }} /> Comentarios Especiales
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="¿Alguna forma de uña en particular, tonos predilectos, o dudas?"
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
                    {isSubmitting ? "Registrando..." : "Enviar por WhatsApp"}
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
                padding: "2rem 0"
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
                <h4 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", fontFamily: "var(--font-serif)" }}>¡Cotización Enviada!</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "280px", margin: "0 auto", lineHeight: "1.5" }}>
                  Tu cotización ha sido registrada en el panel. Redirigiendo a WhatsApp para ultimar los detalles con Aurum Studio...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
