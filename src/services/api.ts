// src/services/api.ts
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

// Ejemplo: obtener usuarios
export const getUsuarios = async () => {
    const res = await api.get("/usuarios");
    return res.data;
};
