// src/services/mock.ts
import type { Usuario, Empresa, Mercado } from "../models/types";


export const mockUsuarios: Usuario[] = [
    {
        id: "1",
        alias: "trader01",
        nombre: "Ana López",
        correo: "ana@correo.com",
        telefono: "555-1234",
        pais: "CR",
        rol: "Trader",
        estado: "activo",
        wallet: {
            saldo: 10000,
            categoria: "junior",
            limiteDiario: 5000,
            consumoDiario: 0,
            historialRecargas: [],
        },
        mercadosHabilitados: ["NYSE"],
    },
];

export const mockMercados: Mercado[] = [
    { id: "NYSE", nombre: "New York Stock Exchange", habilitado: true },
];

export const mockEmpresas: Empresa[] = [
    {
        id: "AAPL",
        nombre: "Apple Inc.",
        mercadoId: "NYSE",
        precioActual: 170,
        historicoPrecios: [{ fecha: "2025-09-29", valor: 170 }],
        cantidadTotal: 1000000,
        capitalizacion: 170000000,
        accionesDisponiblesTesoreria: 500000,
    },
];
