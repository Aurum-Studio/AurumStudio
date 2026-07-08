import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { OrderModal } from "./components/OrderModal";
import { Login } from "./components/Login";
import { AdminPanel } from "./components/AdminPanel";
import { Footer } from "./components/Footer";
import { Cotizador } from "./components/Cotizador";

function AppContent() {
  const { currentView, user, loading, settings } = useApp();

  React.useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--card-radius', settings.cardRadius || '20px');
      document.documentElement.style.setProperty('--card-opacity-val', settings.cardOpacity || '0.02');
      document.documentElement.style.setProperty('--card-blur-val', settings.cardBlur || '25px');
      document.documentElement.style.setProperty('--card-border-val', settings.cardBorderColor || 'rgba(255, 255, 255, 0.08)');
      document.documentElement.style.setProperty('--card-border-width-val', settings.cardBorderWidth || '1px');
    }
  }, [settings]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--accent-gold)",
        fontFamily: "var(--font-serif)",
        gap: "1rem"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(223, 186, 115, 0.1)",
          borderTopColor: "var(--accent-gold)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <span style={{ fontSize: "1.2rem", letterSpacing: "0.1em" }}>Cargando Aurum Studio...</span>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="fade-in">
        {currentView === "client" ? (
          <>
            <Hero />
            <Gallery />
          </>
        ) : currentView === "cotizador" ? (
          <Cotizador />
        ) : (
          user ? <AdminPanel /> : <Login />
        )}
      </main>
      <Footer />
      <OrderModal />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
