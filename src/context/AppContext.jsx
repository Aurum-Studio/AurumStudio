import React, { createContext, useContext, useState, useEffect } from "react";
import { dbService } from "../services/db";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [designs, setDesigns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("client"); // 'client' | 'admin'
  const [selectedDesignForOrder, setSelectedDesignForOrder] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("aurum_theme") || "emerald");
  const [settings, setSettings] = useState({});

  // Escuchar ajustes generales
  useEffect(() => {
    const unsubscribe = dbService.getSettings((data) => {
      setSettings(data);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const saveSettings = async (settingsData) => {
    await dbService.updateSettings(settingsData);
  };

  // Aplicar tema al cambiar
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aurum_theme", theme);
  }, [theme]);

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribe = dbService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // Escuchar lista de diseños en tiempo real
  useEffect(() => {
    const unsubscribe = dbService.getDesigns((data) => {
      setDesigns(data);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // Escuchar lista de pedidos en tiempo real (solo si el administrador está logueado)
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const unsubscribe = dbService.getOrders((data) => {
      setOrders(data);
    });
    return () => unsubscribe && unsubscribe();
  }, [user]);

  // Acciones
  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await dbService.login(email, password);
      setUser(loggedUser);
      setCurrentView("admin");
      return loggedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = async () => {
    await dbService.logout();
    setUser(null);
    setCurrentView("client");
  };

  const addNewDesign = async (designData, imageFile) => {
    return await dbService.addDesign(designData, imageFile);
  };

  const removeDesign = async (id) => {
    await dbService.deleteDesign(id);
  };

  const updateDesignCategory = async (id, category) => {
    await dbService.updateDesignCategory(id, category);
  };

  const placeOrder = async (clientData) => {
    if (!selectedDesignForOrder) return;
    
    const orderData = {
      ...clientData,
      designId: selectedDesignForOrder.id,
      designTitle: selectedDesignForOrder.title,
      designImage: selectedDesignForOrder.imageUrl,
      designPrice: selectedDesignForOrder.price || "N/A"
    };

    const newOrder = await dbService.addOrder(orderData);
    setSelectedDesignForOrder(null);
    return newOrder;
  };

  const placeCustomOrder = async (orderData) => {
    return await dbService.addOrder(orderData);
  };

  const changeOrderStatus = async (id, status) => {
    await dbService.updateOrderStatus(id, status);
  };

  return (
    <AppContext.Provider
      value={{
        designs,
        orders,
        user,
        loading,
        currentView,
        setCurrentView,
        selectedDesignForOrder,
        setSelectedDesignForOrder,
        loginAdmin,
        logoutAdmin,
        addNewDesign,
        removeDesign,
        updateDesignCategory,
        placeOrder,
        placeCustomOrder,
        changeOrderStatus,
        theme,
        setTheme,
        settings,
        saveSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de un AppProvider");
  }
  return context;
};
