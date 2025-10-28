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

// ✅ SERVICIOS DE AUTH
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const verifyToken = async () => {
  const res = await api.get("/auth/verify");
  return res.data;
};

// ✅ SERVICIOS DE TRADER
export const getHomeData = async () => {
  const res = await api.get("/trader/home");
  return res.data;
};

export const getPortfolio = async () => {
  const res = await api.get("/trader/portfolio");
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

export const rechargeWallet = async (amount: number) => {
  const res = await api.post("/trader/recharge", { amount });
  return res.data;
};