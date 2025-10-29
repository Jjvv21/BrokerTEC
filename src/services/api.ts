// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para DEBUG
api.interceptors.request.use((config) => {
  console.log('🚀 Haciendo petición:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('❌ Error en petición:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// ✅ SERVICIOS DE AUTH
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const verifyToken = async () => {
  const res = await api.get("/auth/verify");
  return res.data;
};

// ✅ SERVICIOS DE TRADER - AGREGAR ESTAS FUNCIONES FALTANTES
export const getHomeData = async () => {
  const res = await api.get("/trader/home");
  return res.data;
};

export const getPortfolio = async () => {
  const res = await api.get("/trader/portfolio");
  return res.data;
};

export const getWalletInfo = async () => {
  const res = await api.get("/trader/wallet");
  return res.data;
};

export const rechargeWallet = async (amount: number) => {
  const res = await api.post("/trader/recharge", { amount });
  return res.data;
};

export const buyStock = async (companyId: string, cantidad: number) => {
  const res = await api.post("/trader/buy", { companyId, cantidad });
  return res.data;
};

export const sellStock = async (companyId: string, cantidad: number) => {
  const res = await api.post("/trader/sell", { companyId, cantidad });
  return res.data;
};

export const getCompanyDetail = async (companyId: string) => {
  const res = await api.get(`/trader/company/${companyId}`);
  return res.data;
};

export const getPriceHistory = async (companyId: string) => {
  const res = await api.get(`/trader/price-history/${companyId}`);
  return res.data;
};

export const liquidateAll = async (password: string) => {
  const res = await api.post("/trader/liquidate", { password });
  return res.data;
};

export const getUserProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await api.put("/user/password", { currentPassword, newPassword }); // ✅ CAMBIADO
  return res.data;
};

export const updateUserProfile = async (userData: any) => {
  const res = await api.put("/user/profile", userData); // ✅ CORRECTO
  return res.data;
};