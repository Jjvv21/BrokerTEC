// src/models/types.ts

export type Rol = "Trader" | "Admin" | "Analista";

export interface Usuario {
    id: string;
    alias: string;
    nombre: string;
    correo: string;
    telefono: string;
    pais: string;
    rol: Rol;
    estado: "activo" | "deshabilitado";
    wallet: Wallet;
    mercadosHabilitados: string[]; // IDs de mercados
}

export interface Wallet {
    saldo: number;
    categoria: "junior" | "mid" | "senior";
    limiteDiario: number;
    consumoDiario: number;
    historialRecargas: Recarga[];
}

export interface Recarga {
    id: string;
    monto: number;
    fecha: string;
}

export interface Mercado {
    id: string;
    nombre: string;
    habilitado: boolean;
}

export interface Empresa {
    id: string;
    nombre: string;
    mercadoId: string;
    precioActual: number;
    historicoPrecios: Precio[];
    cantidadTotal: number;
    capitalizacion: number;
    accionesDisponiblesTesoreria: number;
}

export interface Precio {
    fecha: string;
    valor: number;
}

export interface Posicion {
    empresaId: string;
    cantidad: number;
    costoPromedio: number;
}

export interface Trade {
    id: string;
    usuarioId: string;
    empresaId: string;
    tipo: "compra" | "venta";
    cantidad: number;
    precio: number;
    fecha: string;
}