import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../context/AppContext";
import { PlusCircle, Image as ImageIcon, Trash2, ListFilter, ClipboardList, CheckCircle, Clock, Trash, ExternalLink, RefreshCw, Settings, Sliders, X, User, Phone, Calendar, FileText, MessageCircle } from "lucide-react";
import { isFirebaseConfigured, getConnectionStatus } from "../services/db";

export const AdminPanel = () => {
  const { designs, orders, addNewDesign, removeDesign, updateDesignCategory, changeOrderStatus, settings, saveSettings } = useApp();
  const [activeTab, setActiveTab] = useState("upload"); // 'list' | 'upload' | 'orders' | 'settings' | 'advanced'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const connectionStatus = getConnectionStatus();

  // Estado para ajustes generales del sitio
  const [settingsForm, setSettingsForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    contactPhone: "",
    contactAddress: "",
    contactHours: "",
    whatsappNumber: "",
    instagramUrl: "",
    cardRadius: "20px",
    cardOpacity: "0.02",
    cardBlur: "25px",
    cardBorderColor: "rgba(255, 255, 255, 0.08)",
    cardBorderWidth: "1px",
    category1: "Gelish / Semi-permanente",
    category2: "Nail Art Premium",
    category3: "Acrílicas",
    category4: "Soft Gel",
    galleryMode: "static"
  });
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Guard para que el formulario solo se sincronice con la DB en la primera carga,
  // y no sobreescriba cambios que la administradora esté editando en tiempo real.
  const settingsLoadedOnce = React.useRef(false);

  // Sincronizar formulario con los ajustes cargados de la base de datos (solo la primera vez)
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0 && !settingsLoadedOnce.current) {
      settingsLoadedOnce.current = true;
      setSettingsForm({
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        contactPhone: settings.contactPhone || "",
        contactAddress: settings.contactAddress || "",
        contactHours: settings.contactHours || "",
        whatsappNumber: settings.whatsappNumber || "",
        instagramUrl: settings.instagramUrl || "",
        cardRadius: settings.cardRadius || "20px",
        cardOpacity: settings.cardOpacity || "0.02",
        cardBlur: settings.cardBlur || "25px",
        cardBorderColor: settings.cardBorderColor || "rgba(255, 255, 255, 0.08)",
        cardBorderWidth: settings.cardBorderWidth || "1px",
        category1: settings.category1 || "Gelish / Semi-permanente",
        category2: settings.category2 || "Nail Art Premium",
        category3: settings.category3 || "Acrílicas",
        category4: settings.category4 || "Soft Gel",
        galleryMode: settings.galleryMode || "static"
      });
      
      // Ajustar la categoría por defecto del nuevo diseño según la configuración cargada
      setNewDesign(prev => ({
        ...prev,
        category: prev.category === "Soft Gel" || prev.category === "" ? (settings.category1 || "Gelish / Semi-permanente") : prev.category
      }));
    }
  }, [settings]);

  // Aplicar variables CSS al root en tiempo real mientras el usuario mueve los controles en Configuración Avanzada
  useEffect(() => {
    if (activeTab === "advanced") {
      document.documentElement.style.setProperty('--card-radius', settingsForm.cardRadius);
      document.documentElement.style.setProperty('--card-opacity-val', settingsForm.cardOpacity);
      document.documentElement.style.setProperty('--card-blur-val', settingsForm.cardBlur);
      document.documentElement.style.setProperty('--card-border-val', settingsForm.cardBorderColor);
      document.documentElement.style.setProperty('--card-border-width-val', settingsForm.cardBorderWidth);
    } else if (settings) {
      // Restaurar a los valores guardados si cambia de pestaña sin guardar
      document.documentElement.style.setProperty('--card-radius', settings.cardRadius || '20px');
      document.documentElement.style.setProperty('--card-opacity-val', settings.cardOpacity || '0.02');
      document.documentElement.style.setProperty('--card-blur-val', settings.cardBlur || '25px');
      document.documentElement.style.setProperty('--card-border-val', settings.cardBorderColor || 'rgba(255, 255, 255, 0.08)');
      document.documentElement.style.setProperty('--card-border-width-val', settings.cardBorderWidth || '1px');
    }
  }, [settingsForm.cardRadius, settingsForm.cardOpacity, settingsForm.cardBlur, settingsForm.cardBorderColor, settingsForm.cardBorderWidth, settings, activeTab]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSettingsSaving(true);
    setSettingsSuccess(false);
    try {
      await saveSettings(settingsForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2000);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la configuración.");
    } finally {
      setIsSettingsSaving(false);
    }
  };

  // Estado para el formulario de nuevo diseño
  const [newDesign, setNewDesign] = useState({
    title: "",
    category: "Soft Gel",
    description: "",
    price: "",
    manualUrl: "" // Para pegar URL manual
  });
  
  // Guardar múltiples archivos y sus previsualizaciones
  const [imageFiles, setImageFiles] = useState([]); // Array de File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Array de strings (DataURLs o URLs directas)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Manejadores del Formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDesign((prev) => ({ ...prev, [name]: value }));
  };

  // Agregar una imagen por archivo
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Límite de 4 fotos
    const slotsAvailable = 4 - imagePreviews.length;
    const filesToAdd = files.slice(0, slotsAvailable);

    filesToAdd.forEach((file) => {
      setImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Agregar una imagen por URL manual
  const handleAddManualUrl = () => {
    if (!newDesign.manualUrl) return;
    if (imagePreviews.length >= 4) {
      alert("Puedes subir un máximo de 4 fotos por diseño.");
      return;
    }
    setImagePreviews((prev) => [...prev, newDesign.manualUrl]);
    // Agregamos un placeholder null en imageFiles para mantener los índices sincronizados
    setImageFiles((prev) => [...prev, null]);
    setNewDesign((prev) => ({ ...prev, manualUrl: "" }));
  };

  // Eliminar una imagen de la previsualización
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newDesign.title || imagePreviews.length === 0) {
      alert("Por favor proporciona un título y al menos una imagen.");
      return;
    }

    setIsSubmitting(true);
    setUploadSuccess(false);

    try {
      // Filtrar los archivos reales (los manuales tienen null en imageFiles)
      // Pasamos las URLs manuales dentro de designData.images
      const manualUrls = imagePreviews.filter((src, i) => !imageFiles[i]);
      const filesOnly = imageFiles.filter(Boolean);

      await addNewDesign({
        title: newDesign.title,
        category: newDesign.category,
        description: newDesign.description,
        price: newDesign.price,
        images: manualUrls
      }, filesOnly);

      // Limpiar Formulario
      setNewDesign({
        title: "",
        category: "Soft Gel",
        description: "",
        price: "",
        manualUrl: ""
      });
      setImageFiles([]);
      setImagePreviews([]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el diseño.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para formatear fechas
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <section style={{ padding: "4rem 0" }}>
      <div className="container">
        {/* Cabecera del Panel */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "3rem",
          borderBottom: "1px solid var(--border-light)",
          paddingBottom: "1.5rem"
        }}>
          <div>
            <h2 style={{ fontSize: "2.4rem", fontFamily: "var(--font-serif)" }}>Panel de Administración</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Gestiona el catálogo de uñas y revisa las solicitudes de tus clientas en tiempo real.
            </p>
          </div>
          <div>
            {isFirebaseConfigured ? (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.8rem",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "20px",
                color: "#10b981",
                fontSize: "0.8rem",
                fontWeight: 600
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                Conectado a la Nube (Firebase)
              </span>
            ) : (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.8rem",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "20px",
                color: "#f59e0b",
                fontSize: "0.8rem",
                fontWeight: 600
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }}></span>
                Modo Local (LocalStorage)
              </span>
            )}
          </div>
        </div>

        {/* BANNER DE ADVERTENCIA: MODO DEMO */}
        {!isFirebaseConfigured && (
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            display: "flex",
            gap: "0.85rem",
            alignItems: "flex-start"
          }}>
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: "#f59e0b", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                MODO DEMO ACTIVO — Los datos NO se guardan en la nube
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                La app está usando el almacenamiento local del navegador en lugar de Firebase. 
                Cualquier cambio se perderá al limpiar el caché, cambiar de dispositivo o abrir en incógnito.
                Para activar la persistencia real, configura las variables de entorno de Firebase en tu plataforma de despliegue.
              </div>
            </div>
          </div>
        )}

        {/* Tab Buttons (Navegación del Panel) */}
        <div 
          className="admin-tabs"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "2.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            paddingBottom: "0.75rem",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none"
          }}
        >
          <button
            onClick={() => setActiveTab("upload")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "upload" ? "2px solid var(--accent-gold)" : "2px solid transparent",
              color: activeTab === "upload" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "var(--transition-fast)"
            }}
          >
            <PlusCircle style={{ width: "16px", height: "16px", color: activeTab === "upload" ? "var(--accent-gold)" : "inherit" }} />
            Subir Diseño
          </button>

          <button
            onClick={() => setActiveTab("list")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "list" ? "2px solid var(--accent-gold)" : "2px solid transparent",
              color: activeTab === "list" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "var(--transition-fast)"
            }}
          >
            <ListFilter style={{ width: "16px", height: "16px", color: activeTab === "list" ? "var(--accent-gold)" : "inherit" }} />
            Catálogo ({designs.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "orders" ? "2px solid var(--accent-gold)" : "2px solid transparent",
              color: activeTab === "orders" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "var(--transition-fast)",
              position: "relative"
            }}
          >
            <ClipboardList style={{ width: "16px", height: "16px", color: activeTab === "orders" ? "var(--accent-gold)" : "inherit" }} />
            Pedidos Recibidos
            {orders.filter(o => o.status === "Pendiente").length > 0 && (
              <span style={{
                position: "absolute",
                top: "0px",
                right: "-8px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "0.15rem 0.4rem",
                fontSize: "0.65rem",
                fontWeight: 700
              }}>
                {orders.filter(o => o.status === "Pendiente").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "settings" ? "2px solid var(--accent-gold)" : "2px solid transparent",
              color: activeTab === "settings" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "var(--transition-fast)"
            }}
          >
            <Settings style={{ width: "16px", height: "16px", color: activeTab === "settings" ? "var(--accent-gold)" : "inherit" }} />
            Configuración
          </button>

          <button
            onClick={() => setActiveTab("advanced")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "advanced" ? "2px solid var(--accent-gold)" : "2px solid transparent",
              color: activeTab === "advanced" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "var(--transition-fast)"
            }}
          >
            <Sliders style={{ width: "16px", height: "16px", color: activeTab === "advanced" ? "var(--accent-gold)" : "inherit" }} />
            Configuración Avanzada
          </button>
        </div>

        {/* CONTENIDO DE TABS */}

        {/* Tab 1: Subir Nuevo Diseño */}
        {activeTab === "upload" && (
          <div className="glass-panel fade-in" style={{ padding: "3rem 2rem", maxWidth: "800px" }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>Agregar Nueva Creación</h3>
            
            {uploadSuccess && (
              <div style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ade80",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontWeight: 500
              }}>
                ✓ ¡Diseño cargado con éxito! Se mostrará en el catálogo de inmediato.
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="admin-form-grid" style={{ gap: "2rem" }}>
              {/* Formulario Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div className="form-group">
                  <label className="form-label">Título del Diseño *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={newDesign.title}
                    onChange={handleInputChange}
                    placeholder="Ej. Aurora Champagne Glam"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    name="category"
                    value={newDesign.category}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value={settings?.category1 || "Gelish / Semi-permanente"}>{settings?.category1 || "Gelish / Semi-permanente"}</option>
                    <option value={settings?.category2 || "Nail Art Premium"}>{settings?.category2 || "Nail Art Premium"}</option>
                    <option value={settings?.category3 || "Acrílicas"}>{settings?.category3 || "Acrílicas"}</option>
                    <option value={settings?.category4 || "Soft Gel"}>{settings?.category4 || "Soft Gel"}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio Sugerido ($ MXN) - Opcional</label>
                  <input
                    type="number"
                    name="price"
                    value={newDesign.price}
                    onChange={handleInputChange}
                    placeholder="Ej. 450"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="description"
                    value={newDesign.description}
                    onChange={handleInputChange}
                    placeholder="Detalles sobre materiales, técnicas, colores..."
                    className="form-input"
                    rows="4"
                    style={{ resize: "none" }}
                  />
                </div>
              </div>

              {/* Carga de Imágenes (Multi-fotos) */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
                <div className="form-group" style={{ height: "100%" }}>
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Fotos del Diseño (Máx. 4) *</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{imagePreviews.length}/4</span>
                  </label>
                  
                  {/* Grid de Fotos cargadas */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.75rem",
                    marginBottom: "1rem"
                  }}>
                    {imagePreviews.map((src, index) => (
                      <div key={index} style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        paddingBottom: "100%",
                        border: "1px solid var(--border-light)",
                        background: "#0b0f0d"
                      }}>
                        <img 
                          src={src} 
                          alt={`Foto ${index + 1}`} 
                          style={{
                            position: "absolute", top: 0, left: 0,
                            width: "100%", height: "100%", objectFit: "cover"
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: "absolute", top: "4px", right: "4px",
                            backgroundColor: "rgba(239, 68, 68, 0.9)",
                            color: "white", border: "none", borderRadius: "50%",
                            width: "22px", height: "22px", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold"
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Slot para agregar más */}
                    {imagePreviews.length < 4 && (
                      <div style={{
                        position: "relative",
                        borderRadius: "12px",
                        border: "2px dashed var(--border-light)",
                        paddingBottom: "100%",
                        background: "rgba(255,255,255,0.01)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "var(--transition-fast)"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent-gold)"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border-light)"}
                      >
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          color: "var(--text-secondary)", gap: "0.25rem", padding: "0.5rem"
                        }}>
                          <PlusCircle style={{ width: "24px", height: "24px", color: "var(--accent-gold)" }} />
                          <span style={{ fontSize: "0.75rem", textAlign: "center" }}>Agregar Foto</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            opacity: 0, cursor: "pointer"
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Campo para pegar URL directa */}
                  {imagePreviews.length < 4 && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <input
                        type="text"
                        name="manualUrl"
                        value={newDesign.manualUrl}
                        onChange={handleInputChange}
                        placeholder="O pega URL directa de imagen..."
                        className="form-input"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleAddManualUrl}
                        className="btn-outline"
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", borderRadius: "8px" }}
                      >
                        Agregar
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold"
                  style={{ width: "100%", marginTop: "1rem", borderRadius: "10px" }}
                >
                  {isSubmitting ? "Subiendo diseño..." : "Publicar en Galería"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Listado de Diseños Activos */}
        {activeTab === "list" && (
          <div className="fade-in">
            {designs.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "2rem"
              }}>
                {designs.map((design) => (
                  <div 
                    key={design.id} 
                    className="glass-panel" 
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{ width: "100%", height: "200px", position: "relative" }}>
                      <img 
                        src={design.imageUrl} 
                        alt={design.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
                        <span className="category-badge" style={{ fontSize: "0.65rem" }}>{design.category}</span>
                      </div>
                    </div>
                    <div style={{ padding: "1rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{design.title}</h4>
                      {design.price && <p className="text-gold" style={{ fontSize: "0.95rem", fontWeight: 700 }}>${design.price}</p>}
                      
                      {/* Selector interactivo para cambiar la categoría */}
                      <div style={{ marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600 }}>Categoría:</label>
                        <select
                          value={design.category}
                          onChange={async (e) => {
                            try {
                              await updateDesignCategory(design.id, e.target.value);
                            } catch (err) {
                              console.error(err);
                              alert("Error al actualizar la categoría.");
                            }
                          }}
                          className="form-select"
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.35rem 0.5rem",
                            borderRadius: "6px",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--text-primary)",
                            cursor: "pointer"
                          }}
                        >
                          <option value={settings?.category1 || "Gelish / Semi-permanente"}>{settings?.category1 || "Gelish / Semi-permanente"}</option>
                          <option value={settings?.category2 || "Nail Art Premium"}>{settings?.category2 || "Nail Art Premium"}</option>
                          <option value={settings?.category3 || "Acrílicas"}>{settings?.category3 || "Acrílicas"}</option>
                          <option value={settings?.category4 || "Soft Gel"}>{settings?.category4 || "Soft Gel"}</option>
                        </select>
                      </div>

                      <div style={{
                        marginTop: "1.5rem",
                        display: "flex",
                        justifyContent: "flex-end",
                        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                        paddingTop: "0.75rem"
                      }}>
                        <button
                          onClick={() => {
                            if (window.confirm("¿Segura que deseas eliminar este diseño del catálogo?")) {
                              removeDesign(design.id);
                            }
                          }}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                        >
                          <Trash2 style={{ width: "12px", height: "12px" }} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>No hay diseños publicados en tu catálogo.</p>
                <button onClick={() => setActiveTab("upload")} className="btn-gold">Subir tu primera foto</button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pedidos Recibidos */}
        {activeTab === "orders" && (
          <div className="glass-panel fade-in" style={{ padding: "2rem", overflowX: "auto" }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>Historial de Solicitudes</h3>
            
            {orders.length > 0 ? (
              <>
                {/* Tabla para Computadora */}
                <table className="desktop-orders-table">
                  <thead>
                    <tr style={{
                      borderBottom: "1px solid var(--border-gold)",
                      textAlign: "left",
                      color: "var(--accent-gold)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05rem"
                    }}>
                      <th style={{ padding: "1rem 0.5rem" }}>Fecha</th>
                      <th style={{ padding: "1rem 0.5rem" }}>Diseño Elegido</th>
                      <th style={{ padding: "1rem 0.5rem" }}>Cliente</th>
                      <th style={{ padding: "1rem 0.5rem" }}>Notas del Pedido</th>
                      <th style={{ padding: "1rem 0.5rem" }}>Estado</th>
                      <th style={{ padding: "1rem 0.5rem", textAlign: "right" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                          fontSize: "0.9rem"
                        }}
                      >
                        <td style={{ padding: "1.2rem 0.5rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td style={{ padding: "1.2rem 0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <img 
                              src={order.designImage} 
                              alt={order.designTitle} 
                              style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                            <div>
                              <div style={{ fontWeight: 600 }}>{order.designTitle}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)" }}>${order.designPrice}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "1.2rem 0.5rem" }}>
                          <div style={{ fontWeight: 600 }}>{order.clientName}</div>
                          <a 
                            href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              marginTop: "0.2rem"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-gold)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                          >
                            {order.clientPhone}
                            <ExternalLink style={{ width: "10px", height: "10px" }} />
                          </a>
                        </td>
                        <td style={{ padding: "1.2rem 0.5rem", maxWidth: "220px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          <div>{order.preferredDate && <div>🕒 Sugerido: <em style={{color: "var(--text-primary)"}}>{order.preferredDate.replace("T", " ")}</em></div>}</div>
                          <div style={{ marginTop: "0.25rem", fontStyle: "italic" }}>
                            {order.clientNotes ? `"${order.clientNotes}"` : "Sin comentarios"}
                          </div>
                        </td>
                        <td style={{ padding: "1.2rem 0.5rem" }}>
                          <select
                            value={order.status}
                            onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                            style={{
                              background: order.status === "Completado" 
                                ? "rgba(34, 197, 94, 0.1)" 
                                : order.status === "En Proceso"
                                ? "rgba(234, 179, 8, 0.1)"
                                : "rgba(255, 255, 255, 0.05)",
                              color: order.status === "Completado" 
                                ? "#4ade80" 
                                : order.status === "En Proceso"
                                ? "#facc15"
                                : "var(--text-secondary)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "6px",
                              padding: "0.3rem 0.6rem",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              outline: "none"
                            }}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Completado">Completado</option>
                          </select>
                        </td>
                        <td style={{ padding: "1.2rem 0.5rem", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="btn-secondary"
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                border: "1px solid rgba(255,255,255,0.08)"
                              }}
                            >
                              Detalles
                            </button>
                            <a
                              href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(order.clientName)},%20te%20escribo%20de%20Aurum%20Studio%20para%20coordinar%20tu%20cita%20con%20el%20diseño%20${encodeURIComponent(order.designTitle)}...`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline"
                              style={{
                                fontSize: "0.7rem",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                textDecoration: "none"
                              }}
                            >
                              Chatear
                              <ExternalLink style={{ width: "12px", height: "12px" }} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Vista en Tarjetas para Móviles (iPad/Celulares) */}
                <div className="mobile-orders-list">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="glass-card fade-in" 
                      style={{
                        padding: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        borderRadius: "16px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {formatDate(order.createdAt)}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                          style={{
                            background: order.status === "Completado" 
                              ? "rgba(34, 197, 94, 0.1)" 
                              : order.status === "En Proceso"
                              ? "rgba(234, 179, 8, 0.1)"
                              : "rgba(255, 255, 255, 0.05)",
                            color: order.status === "Completado" 
                              ? "#4ade80" 
                              : order.status === "En Proceso"
                              ? "#facc15"
                              : "var(--text-secondary)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            outline: "none"
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Completado">Completado</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <img 
                          src={order.designImage} 
                          alt={order.designTitle} 
                          style={{ width: "55px", height: "55px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{order.designTitle}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--accent-gold)" }}>${order.designPrice}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "0.75rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{order.clientName}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                          Tel: {order.clientPhone}
                        </div>
                        {order.preferredDate && (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                            Fecha sugerida: <strong style={{ color: "var(--text-primary)" }}>{order.preferredDate.replace("T", " ")}</strong>
                          </div>
                        )}
                      </div>

                      {order.clientNotes && (
                        <div style={{ 
                          background: "rgba(255, 255, 255, 0.02)",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          fontStyle: "italic",
                          borderLeft: "2px solid var(--accent-gold)"
                        }}>
                          "{order.clientNotes}"
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            fontSize: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Ver Detalles
                        </button>
                        <a
                          href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(order.clientName)},%20te%20escribo%20de%20Aurum%20Studio%20para%20coordinar%20tu%20cita%20con%20el%20diseño%20${encodeURIComponent(order.designTitle)}...`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline"
                          style={{
                            flex: 1,
                            fontSize: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.3rem",
                            textDecoration: "none"
                          }}
                        >
                          Chatear
                          <ExternalLink style={{ width: "12px", height: "12px" }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
                Aún no has recibido solicitudes de pedido de clientas.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Ajustes del Sitio */}
        {activeTab === "settings" && (
          <div className="glass-panel fade-in" style={{ padding: "3rem 2rem", maxWidth: "800px" }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>Ajustes del Sitio Web</h3>
            
            {settingsSuccess && (
              <div style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ade80",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontWeight: 500
              }}>
                ✓ ¡Configuración guardada! Los cambios ya se reflejan en el sitio web de inmediato.
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Sección: Textos del Hero */}
              <div>
                <h4 style={{ color: "var(--accent-gold)", fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                  Textos Principales (Hero)
                </h4>
                <div className="form-group">
                  <label className="form-label">Título de Bienvenida</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="form-input"
                    placeholder="Diseños que cautivan"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción de Bienvenida</label>
                  <textarea
                    name="heroSubtitle"
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    className="form-input"
                    rows="3"
                    style={{ resize: "none" }}
                    placeholder="En Aurum Studio transformamos tus manos..."
                  />
                </div>
              </div>

              {/* Sección: Datos de Contacto */}
              <div>
                <h4 style={{ color: "var(--accent-gold)", fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                  Información del Negocio
                </h4>
                <div className="admin-form-grid-half">
                  <div className="form-group">
                    <label className="form-label">Teléfono Público (Texto)</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={settingsForm.contactPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      className="form-input"
                      placeholder="+52 1 234 567 8900"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Número WhatsApp (Pedidos - Sin espacios ni símbolos)</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="form-input"
                      placeholder="521234567890"
                    />
                  </div>
                </div>
                <div className="admin-form-grid-half">
                  <div className="form-group">
                    <label className="form-label">Dirección del Salón</label>
                    <input
                      type="text"
                      name="contactAddress"
                      value={settingsForm.contactAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactAddress: e.target.value })}
                      className="form-input"
                      placeholder="Av. Luxury Gold 789..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Horario de Atención</label>
                    <input
                      type="text"
                      name="contactHours"
                      value={settingsForm.contactHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactHours: e.target.value })}
                      className="form-input"
                      placeholder="Lunes a Sábado: 10am - 8pm"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div>
                <h4 style={{ color: "var(--accent-gold)", fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                  Redes Sociales
                </h4>
                <div className="admin-form-grid-half">
                  <div className="form-group">
                    <label className="form-label">Enlace de Instagram</label>
                    <input
                      type="text"
                      name="instagramUrl"
                      value={settingsForm.instagramUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      className="form-input"
                      placeholder="https://instagram.com/tu-salon"
                    />
                  </div>

                </div>
              </div>

              {/* Nombres de Categorías */}
              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ color: "var(--accent-gold)", fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                  Nombres de las Categorías del Catálogo
                </h4>
                <div className="admin-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Categoría 1</label>
                    <input
                      type="text"
                      value={settingsForm.category1}
                      onChange={(e) => setSettingsForm({ ...settingsForm, category1: e.target.value })}
                      className="form-input"
                      placeholder="Gelish / Semi-permanente"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoría 2</label>
                    <input
                      type="text"
                      value={settingsForm.category2}
                      onChange={(e) => setSettingsForm({ ...settingsForm, category2: e.target.value })}
                      className="form-input"
                      placeholder="Nail Art Premium"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoría 3</label>
                    <input
                      type="text"
                      value={settingsForm.category3}
                      onChange={(e) => setSettingsForm({ ...settingsForm, category3: e.target.value })}
                      className="form-input"
                      placeholder="Acrílicas"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoría 4</label>
                    <input
                      type="text"
                      value={settingsForm.category4}
                      onChange={(e) => setSettingsForm({ ...settingsForm, category4: e.target.value })}
                      className="form-input"
                      placeholder="Soft Gel"
                    />
                  </div>
                </div>
              </div>

              {/* Comportamiento de Galería (Collage / Carrusel) */}
              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ color: "var(--accent-gold)", fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                  Comportamiento de Fotos en Catálogo
                </h4>
                <div className="form-group" style={{ maxWidth: "400px" }}>
                  <label className="form-label">Efecto al pasar el cursor o dar click</label>
                  <select
                    value={settingsForm.galleryMode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, galleryMode: e.target.value })}
                    className="form-select"
                  >
                    <option value="static">Collage Estático (Muestra todas las fotos juntas)</option>
                    <option value="hover-carousel">Carrusel automático al pasar el mouse (Hover)</option>
                    <option value="click-carousel">Carrusel interactivo al hacer click</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSettingsSaving}
                className="btn-gold"
                style={{ alignSelf: "flex-end", marginTop: "1.5rem", borderRadius: "10px" }}
              >
                {isSettingsSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Configuración Avanzada */}
        {activeTab === "advanced" && (
          <div className="glass-panel fade-in" style={{ padding: "3rem 2rem", maxWidth: "1050px", width: "100%" }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>Configuración Avanzada (Diseño del Sitio)</h3>
            
            {settingsSuccess && (
              <div style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ade80",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontWeight: 500
              }}>
                ✓ ¡Estilos avanzados guardados y aplicados de inmediato!
              </div>
            )}

            <div className="advanced-settings-grid">
              {/* Formulario de Configuración */}
              <form onSubmit={handleSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
                <div>
                  <h4 style={{ color: "var(--accent-gold)", fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1.2rem" }}>
                    Estilo de Tarjetas de Catálogo (Glassmorphism)
                  </h4>
                  
                  {/* 1. Redondeo de Esquinas */}
                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label">Bordes Redondeados (Esquinas)</label>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                        {settingsForm.cardRadius}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      step="2"
                      value={parseInt(settingsForm.cardRadius) || 20}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cardRadius: `${e.target.value}px` })}
                      style={{ cursor: "pointer", accentColor: "var(--accent-gold)" }}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Controla qué tan circulares o rectas serán las esquinas de los cuadros de uñas.
                    </span>
                  </div>

                  {/* 2. Opacidad del Fondo */}
                  <div className="form-group" style={{ marginTop: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label">Opacidad del Fondo (Vidrio)</label>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                        {Math.round((parseFloat(settingsForm.cardOpacity) || 0.02) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.8"
                      step="0.01"
                      value={parseFloat(settingsForm.cardOpacity) || 0.02}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cardOpacity: e.target.value })}
                      style={{ cursor: "pointer", accentColor: "var(--accent-gold)" }}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Aumenta este valor si prefieres que las tarjetas sean de color más sólido para ver mejor el texto.
                    </span>
                  </div>

                  {/* 3. Desenfoque (Glass Blur) */}
                  <div className="form-group" style={{ marginTop: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label">Efecto de Desenfoque (Glass Blur)</label>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                        {settingsForm.cardBlur}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={parseInt(settingsForm.cardBlur) || 25}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cardBlur: `${e.target.value}px` })}
                      style={{ cursor: "pointer", accentColor: "var(--accent-gold)" }}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Controla qué tan borroso se verá el fondo que pasa por detrás del cuadro.
                    </span>
                  </div>

                  {/* 4. Color y Grosor del Borde */}
                  <div className="admin-form-grid-half" style={{ marginTop: "1.5rem" }}>
                    <div className="form-group">
                      <label className="form-label">Grosor del Borde</label>
                      <select
                        value={settingsForm.cardBorderWidth || "1px"}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cardBorderWidth: e.target.value })}
                        className="form-select"
                        style={{ fontSize: "0.85rem", padding: "0.6rem" }}
                      >
                        <option value="1px">Delgado (1px)</option>
                        <option value="2px">Mediano (2px)</option>
                        <option value="3px">Grueso (3px)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color de Borde (Fórmula RGBA o Hex)</label>
                      <input
                        type="text"
                        value={settingsForm.cardBorderColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cardBorderColor: e.target.value })}
                        className="form-input"
                        placeholder="rgba(255, 255, 255, 0.08)"
                        style={{ fontSize: "0.85rem", padding: "0.6rem" }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSettingsSaving}
                  className="btn-gold"
                  style={{ alignSelf: "flex-start", marginTop: "1.5rem", borderRadius: "10px" }}
                >
                  {isSettingsSaving ? "Guardando..." : "Aplicar y Guardar Estilos"}
                </button>
              </form>

              {/* Columna de Vista Previa (Sticky) */}
              <div style={{
                position: "sticky",
                top: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                padding: "1.5rem",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <h4 style={{ 
                  color: "var(--accent-gold)", 
                  fontSize: "0.9rem", 
                  fontWeight: 600, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.05em",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <Sliders style={{ width: "16px", height: "16px" }} />
                  Vista Previa en Vivo
                </h4>
                
                {/* Tarjeta Mock con los estilos aplicados directamente */}
                <div 
                  className="glass-card" 
                  style={{
                    borderRadius: settingsForm.cardRadius,
                    background: `rgba(255, 255, 255, ${settingsForm.cardOpacity})`,
                    backdropFilter: `blur(${settingsForm.cardBlur}) saturate(150%)`,
                    WebkitBackdropFilter: `blur(${settingsForm.cardBlur}) saturate(150%)`,
                    border: `${settingsForm.cardBorderWidth} solid ${settingsForm.cardBorderColor}`,
                    boxShadow: "var(--shadow-luxury)",
                    overflow: "hidden",
                    position: "relative",
                    transition: "transform 0.3s ease, border-color 0.3s ease",
                    width: "100%"
                  }}
                >
                  {/* Foto Mock */}
                  <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                    <img 
                      src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80" 
                      alt="Diseño Preview" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span className="category-badge" style={{ position: "absolute", top: "12px", left: "12px" }}>
                      {settingsForm.category1 || "Nail Art Premium"}
                    </span>
                  </div>
                  
                  {/* Cuerpo de la tarjeta Mock */}
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 500, fontFamily: "var(--font-serif)", color: "var(--text-primary)", margin: 0 }}>
                        Elegancia Dorada
                      </h4>
                      <span style={{ color: "var(--accent-gold)", fontWeight: 600, fontSize: "0.95rem" }}>
                        $450 MXN
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: "1.4", marginBottom: "1rem", height: "36px", overflow: "hidden", margin: "0 0 1rem 0" }}>
                      Set de lujo con detalles en hoja de oro y un acabado mate aterciopelado sumamente premium.
                    </p>
                    
                    <button className="btn-gold" style={{ width: "100%", pointerEvents: "none", fontSize: "0.8rem", padding: "0.5rem" }}>
                      Solicitar Diseño
                    </button>
                  </div>
                </div>
                
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textAlign: "center", fontStyle: "italic", lineHeight: "1.3" }}>
                  * Mueve los controles de la izquierda y mira el cambio al instante.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLES DEL PEDIDO */}
      {selectedOrderDetails && createPortal(
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
              padding: "2rem",
              boxShadow: "var(--shadow-luxury)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "24px"
            }}
          >
            {/* Botón Cerrar */}
            <button 
              onClick={() => setSelectedOrderDetails(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
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

            <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-gold)", paddingBottom: "0.8rem" }}>
              <h4 style={{ fontSize: "1.4rem", fontFamily: "var(--font-serif)", color: "var(--accent-gold)" }}>
                Detalles del Pedido
              </h4>
            </div>

            {/* Datos del Cliente */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <User style={{ width: "14px", height: "14px", color: "var(--accent-gold)" }} />
                <span><strong>Cliente:</strong> {selectedOrderDetails.clientName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone style={{ width: "14px", height: "14px", color: "var(--accent-gold)" }} />
                <span>
                  <strong>Teléfono:</strong> {selectedOrderDetails.clientPhone || "No especificado"}
                </span>
              </div>
              {selectedOrderDetails.preferredDate && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "var(--accent-gold)" }} />
                  <span><strong>Fecha Sugerida:</strong> {String(selectedOrderDetails.preferredDate).replace("T", " ")}</span>
                </div>
              )}
              {selectedOrderDetails.clientNotes && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <FileText style={{ width: "14px", height: "14px", color: "var(--accent-gold)", marginTop: "0.2rem" }} />
                  <span><strong>Comentarios:</strong> <em style={{ color: "var(--text-secondary)" }}>"{selectedOrderDetails.clientNotes}"</em></span>
                </div>
              )}
            </div>

            {/* Diseño / Modelo */}
            <div style={{ 
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div 
                  onClick={() => setLightboxImage(selectedOrderDetails.designImage)}
                  style={{ 
                    cursor: "pointer", 
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                  title="Ver imagen en tamaño completo / Descargar"
                >
                  <img 
                    src={selectedOrderDetails.designImage} 
                    alt={selectedOrderDetails.designTitle} 
                    style={{ 
                      width: "70px", 
                      height: "70px", 
                      objectFit: "cover",
                      display: "block",
                      transition: "opacity 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = "0.85"}
                    onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedOrderDetails.designTitle}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)", marginTop: "0.25rem" }}>
                    ${selectedOrderDetails.designPrice}
                  </div>
                  <button 
                    onClick={() => setLightboxImage(selectedOrderDetails.designImage)}
                    style={{ 
                      fontSize: "0.75rem", 
                      color: "var(--accent-gold)", 
                      textDecoration: "underline",
                      marginTop: "0.2rem",
                      display: "inline-block",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      padding: 0
                    }}
                  >
                    Ver en Grande / Descargar
                  </button>
                </div>
              </div>

              {/* Conceptos del Cotizador si existen */}
              {selectedOrderDetails.orderDetails && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    Desglose de Conceptos:
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", padding: 0 }}>
                    {selectedOrderDetails.orderDetails.split(", ").map((concept, index) => {
                      const priceMatch = concept.match(/\(\$(-?\d+(\.\d+)?)\)/);
                      const name = concept.replace(/\s\(\$-?\d+(\.\d+)?\)/, "");
                      const priceStr = priceMatch ? `$${parseFloat(priceMatch[1]).toFixed(2)}` : "";
                      return (
                        <li key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          <span>• {name}</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{priceStr}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <a
                href={`https://wa.me/${(selectedOrderDetails.clientPhone || "").replace(/[^0-9]/g, "")}?text=Hola%20${encodeURIComponent(selectedOrderDetails.clientName || "")},%20te%20escribo%20de%20Aurum%20Studio%20para%20coordinar%20tu%20cita%20con%20el%20diseño%20${encodeURIComponent(selectedOrderDetails.designTitle || "")}...`}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  border: "none"
                }}
              >
                <MessageCircle style={{ width: "16px", height: "16px" }} />
                Chatear por WhatsApp
              </a>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Cerrar Detalles
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* LIGHTBOX DE IMAGEN DE REFERENCIA */}
      {lightboxImage && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(6, 9, 7, 0.95)",
          backdropFilter: "blur(15px)",
          zIndex: 20000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }}>
          {/* Barra superior de control */}
          <div style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            display: "flex",
            gap: "0.8rem",
            zIndex: 20001
          }}>
            {/* Descargar */}
            <a 
              href={lightboxImage} 
              download="referencia_diseno.jpg"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "rgba(223, 186, 115, 0.15)",
                border: "1px solid var(--border-gold)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--accent-gold)",
                textDecoration: "none"
              }}
              title="Descargar imagen"
            >
              <ExternalLink style={{ width: "18px", height: "18px" }} />
            </a>

            {/* Cerrar */}
            <button 
              onClick={() => setLightboxImage(null)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white"
              }}
              title="Cerrar vista"
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          {/* Imagen Contenedora */}
          <div style={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "75vh",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <img 
              src={lightboxImage} 
              alt="Referencia en grande" 
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "75vh",
                objectFit: "contain"
              }}
            />
          </div>

          {/* Pie de foto */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Imagen de referencia del pedido. Puedes hacer zoom con los dedos en tu móvil abriéndola en original.
            </span>
            <div style={{ marginTop: "0.5rem" }}>
              <a 
                href={lightboxImage} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  color: "var(--accent-gold)", 
                  fontSize: "0.85rem", 
                  textDecoration: "underline",
                  fontWeight: 500
                }}
              >
                Abrir imagen en pestaña nueva ↗
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
