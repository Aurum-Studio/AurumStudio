import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL
} from "firebase/storage";

// Configuración de Firebase (se lee de variables de entorno de Vite o se deja vacío para modo Mock)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verificar si Firebase está completamente configurado en el entorno
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.storageBucket;

let app, auth, db, storage;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("🔥 Firebase inicializado con éxito.");
  } catch (error) {
    console.error("Error al inicializar Firebase, cayendo a modo de prueba local:", error);
  }
} else {
  console.log("ℹ️ Usando base de datos simulada en memoria/LocalStorage (Modo Demo).");
}

// ==========================================
// CONFIGURACIÓN DE PÁGINA PREDETERMINADA
// ==========================================
const DEFAULT_SETTINGS = {
  heroTitle: "Diseños que cautivan",
  heroSubtitle: "En Aurum Studio transformamos tus manos en una obra de arte. Diseños premium personalizados, materiales de la más alta calidad y un cuidado meticuloso para un acabado deslumbrante.",
  contactPhone: "+52 1 234 567 8900",
  contactAddress: "Av. Luxury Gold 789, Colonia Niza, CDMX",
  contactHours: "Lunes a Sábado: 10:00 AM - 8:00 PM",
  whatsappNumber: "521234567890",
  instagramUrl: "#",
  facebookUrl: "#",
  cardRadius: "20px",
  cardOpacity: "0.02",
  cardBlur: "25px",
  cardBorderColor: "rgba(255, 255, 255, 0.08)",
  cardBorderWidth: "1px",
  category1: "Gelish / Semi-permanente",
  category2: "Nail Art Premium",
  category3: "Acrílicas",
  category4: "Soft Gel"
};

// ==========================================
// DISEÑOS DE UÑAS PREDETERMINADOS (MOCK DATA)
// ==========================================
const DEFAULT_DESIGNS = [
  {
    id: "mock-1",
    title: "Efecto Aurora Champagne",
    category: "Soft Gel",
    description: "Diseño elegante con efecto aurora y destellos dorados holográficos, perfecto para eventos especiales.",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    price: "450",
    createdAt: new Date(2026, 6, 1).getTime()
  },
  {
    id: "mock-2",
    title: "Acrílico Nude Glazed",
    category: "Acrílicas",
    description: "Estilo minimalista con base nude de alta cobertura y un baño de polvo glazed perlado.",
    imageUrl: "https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&w=800&q=80",
    price: "500",
    createdAt: new Date(2026, 6, 2).getTime()
  },
  {
    id: "mock-3",
    title: "Emerald Velvet",
    category: "Nail Art Premium",
    description: "Diseño magnético efecto terciopelo en tono verde esmeralda con detalles de hojas de oro de 24k.",
    imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80",
    price: "600",
    createdAt: new Date(2026, 6, 3).getTime()
  },
  {
    id: "mock-4",
    title: "French Vanilla Moderno",
    category: "Gelish / Semi-permanente",
    description: "El clásico diseño francés reinventado con una línea ultra delgada en tono vainilla sobre base rosada translúcida.",
    imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80",
    price: "320",
    createdAt: new Date(2026, 6, 4).getTime()
  }
];

// Inicializar LocalStorage con datos de prueba si están vacíos
if (!localStorage.getItem("aurum_designs")) {
  localStorage.setItem("aurum_designs", JSON.stringify(DEFAULT_DESIGNS));
}
if (!localStorage.getItem("aurum_orders")) {
  localStorage.setItem("aurum_orders", JSON.stringify([]));
}
if (!localStorage.getItem("aurum_settings")) {
  localStorage.setItem("aurum_settings", JSON.stringify(DEFAULT_SETTINGS));
}

// Helper para notificar cambios locales en la misma pestaña (para modo Mock)
const notifyLocalUpdate = (key) => {
  window.dispatchEvent(new CustomEvent("aurum_local_update", { detail: key }));
};

// Helper para redimensionar imágenes mock (para evitar saturar LocalStorage)
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7)); // comprimir al 70% calidad
      };
    };
  });
};

// Helper para subir imágenes a Cloudinary
const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary no está configurado en las variables de entorno.");
  }
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "designs");
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error al subir la imagen a Cloudinary.");
  }
  
  const data = await response.json();
  return data.secure_url;
};

// ==========================================
// INTERFAZ DE SERVICIOS UNIFICADA
// ==========================================

export const dbService = {
  // --- Autenticación ---
  login: async (email, password) => {
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      // Simulación local de login
      if (email === "admin@aurum.com" && password === "admin123") {
        const mockUser = { email, uid: "mock-admin-uid" };
        localStorage.setItem("aurum_admin_logged", "true");
        notifyLocalUpdate("aurum_admin_logged");
        return mockUser;
      } else {
        throw new Error("Credenciales de administrador incorrectas.");
      }
    }
  },

  logout: async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      localStorage.removeItem("aurum_admin_logged");
      notifyLocalUpdate("aurum_admin_logged");
    }
  },

  onAuthChange: (callback) => {
    if (isFirebaseConfigured) {
      return onAuthStateChanged(auth, callback);
    } else {
      const checkAuth = () => {
        const isLoggedIn = localStorage.getItem("aurum_admin_logged") === "true";
        if (isLoggedIn) {
          callback({ email: "admin@aurum.com", uid: "mock-admin-uid" });
        } else {
          callback(null);
        }
      };
      
      checkAuth();
      
      const handleUpdate = (e) => {
        if (e.key === "aurum_admin_logged" || (e.type === "aurum_local_update" && e.detail === "aurum_admin_logged")) {
          checkAuth();
        }
      };
      
      window.addEventListener("storage", handleUpdate);
      window.addEventListener("aurum_local_update", handleUpdate);
      
      return () => {
        window.removeEventListener("storage", handleUpdate);
        window.removeEventListener("aurum_local_update", handleUpdate);
      };
    }
  },

  // --- Diseños de Uñas ---
  getDesigns: (callback) => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, "designs"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const designs = [];
        snapshot.forEach((doc) => {
          designs.push({ id: doc.id, ...doc.data() });
        });
        callback(designs);
      });
    } else {
      const getLocalDesigns = () => {
        const data = JSON.parse(localStorage.getItem("aurum_designs") || "[]");
        callback(data.sort((a, b) => b.createdAt - a.createdAt));
      };
      
      getLocalDesigns();
      
      const handleUpdate = (e) => {
        if (e.key === "aurum_designs" || (e.type === "aurum_local_update" && e.detail === "aurum_designs")) {
          getLocalDesigns();
        }
      };
      
      window.addEventListener("storage", handleUpdate);
      window.addEventListener("aurum_local_update", handleUpdate);
      
      return () => {
        window.removeEventListener("storage", handleUpdate);
        window.removeEventListener("aurum_local_update", handleUpdate);
      };
    }
  },

  addDesign: async (designData, imageFile) => {
    if (isFirebaseConfigured) {
      let imageUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80";
      
      if (imageFile) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (cloudName && uploadPreset) {
          imageUrl = await uploadToCloudinary(imageFile);
        } else {
          const storageRef = ref(storage, `designs/${Date.now()}_${imageFile.name}`);
          const uploadResult = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
        }
      } else if (designData.imageUrl) {
        imageUrl = designData.imageUrl;
      }
      
      const docRef = await addDoc(collection(db, "designs"), {
        ...designData,
        imageUrl,
        createdAt: Date.now()
      });
      return { id: docRef.id, ...designData, imageUrl };
    } else {
      // Guardar localmente
      let imageUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80";
      
      if (imageFile) {
        imageUrl = await compressImage(imageFile);
      } else if (designData.imageUrl) {
        imageUrl = designData.imageUrl;
      }

      const designs = JSON.parse(localStorage.getItem("aurum_designs") || "[]");
      const newDesign = {
        id: `mock-${Date.now()}`,
        ...designData,
        imageUrl,
        createdAt: Date.now()
      };
      designs.push(newDesign);
      localStorage.setItem("aurum_designs", JSON.stringify(designs));
      
      // Notificar a la UI en tiempo de ejecución inmediato
      notifyLocalUpdate("aurum_designs");
      return newDesign;
    }
  },

  deleteDesign: async (id) => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, "designs", id));
    } else {
      const designs = JSON.parse(localStorage.getItem("aurum_designs") || "[]");
      const updated = designs.filter(d => d.id !== id);
      localStorage.setItem("aurum_designs", JSON.stringify(updated));
      notifyLocalUpdate("aurum_designs");
    }
  },

  updateDesignCategory: async (id, category) => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, "designs", id), { category });
    } else {
      const designs = JSON.parse(localStorage.getItem("aurum_designs") || "[]");
      const updated = designs.map(d => d.id === id ? { ...d, category } : d);
      localStorage.setItem("aurum_designs", JSON.stringify(updated));
      notifyLocalUpdate("aurum_designs");
    }
  },

  // --- Pedidos (Orders) ---
  getOrders: (callback) => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const orders = [];
        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        callback(orders);
      });
    } else {
      const getLocalOrders = () => {
        const data = JSON.parse(localStorage.getItem("aurum_orders") || "[]");
        callback(data.sort((a, b) => b.createdAt - a.createdAt));
      };
      
      getLocalOrders();
      
      const handleUpdate = (e) => {
        if (e.key === "aurum_orders" || (e.type === "aurum_local_update" && e.detail === "aurum_orders")) {
          getLocalOrders();
        }
      };
      
      window.addEventListener("storage", handleUpdate);
      window.addEventListener("aurum_local_update", handleUpdate);
      
      return () => {
        window.removeEventListener("storage", handleUpdate);
        window.removeEventListener("aurum_local_update", handleUpdate);
      };
    }
  },

  addOrder: async (orderData) => {
    const finalOrder = {
      ...orderData,
      status: "Pendiente",
      createdAt: Date.now()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, "orders"), finalOrder);
      return { id: docRef.id, ...finalOrder };
    } else {
      const orders = JSON.parse(localStorage.getItem("aurum_orders") || "[]");
      const newOrder = {
        id: `order-${Date.now()}`,
        ...finalOrder
      };
      orders.push(newOrder);
      localStorage.setItem("aurum_orders", JSON.stringify(orders));
      notifyLocalUpdate("aurum_orders");
      return newOrder;
    }
  },

  updateOrderStatus: async (id, status) => {
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, "orders", id), { status });
    } else {
      const orders = JSON.parse(localStorage.getItem("aurum_orders") || "[]");
      const updated = orders.map(o => o.id === id ? { ...o, status } : o);
      localStorage.setItem("aurum_orders", JSON.stringify(updated));
      notifyLocalUpdate("aurum_orders");
    }
  },

  // --- Ajustes del Sitio (General Settings) ---
  getSettings: (callback) => {
    if (isFirebaseConfigured) {
      return onSnapshot(doc(db, "settings", "main"), (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        } else {
          setDoc(doc(db, "settings", "main"), DEFAULT_SETTINGS);
          callback(DEFAULT_SETTINGS);
        }
      });
    } else {
      const getLocalSettings = () => {
        const data = JSON.parse(localStorage.getItem("aurum_settings") || "{}");
        callback({ ...DEFAULT_SETTINGS, ...data });
      };
      
      getLocalSettings();
      
      const handleUpdate = (e) => {
        if (e.key === "aurum_settings" || (e.type === "aurum_local_update" && e.detail === "aurum_settings")) {
          getLocalSettings();
        }
      };
      
      window.addEventListener("storage", handleUpdate);
      window.addEventListener("aurum_local_update", handleUpdate);
      
      return () => {
        window.removeEventListener("storage", handleUpdate);
        window.removeEventListener("aurum_local_update", handleUpdate);
      };
    }
  },

  updateSettings: async (settingsData) => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, "settings", "main"), settingsData, { merge: true });
    } else {
      localStorage.setItem("aurum_settings", JSON.stringify(settingsData));
      notifyLocalUpdate("aurum_settings");
    }
    return settingsData;
  }
};
