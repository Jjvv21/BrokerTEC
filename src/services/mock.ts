// src/services/mock.ts
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
      saldo: 12000,
      categoria: "junior",
      limiteDiario: 5000,
      consumoDiario: 0,
      historialRecargas: [],
    },
    mercadosHabilitados: ["NYSE", "NASDAQ"],
  },
  {
    id: "2",
    alias: "admin01",
    nombre: "Carlos Pérez",
    correo: "carlos@brokertec.com",
    telefono: "555-5678",
    pais: "CR",
    rol: "Admin",
    estado: "activo",
    wallet: {
      saldo: 0,
      categoria: "senior",
      limiteDiario: 0,
      consumoDiario: 0,
      historialRecargas: [],
    },
    mercadosHabilitados: [],
  },
  {
    id: "3",
    alias: "analista01",
    nombre: "María Gómez",
    correo: "maria@brokertec.com",
    telefono: "555-9101",
    pais: "CR",
    rol: "Analista",
    estado: "activo",
    wallet: {
      saldo: 0,
      categoria: "mid",
      limiteDiario: 0,
      consumoDiario: 0,
      historialRecargas: [],
    },
    mercadosHabilitados: ["NYSE"],
  },
];

export const mockMercados: Mercado[] = [
  { id: "NYSE", nombre: "New York Stock Exchange", habilitado: true },
  { id: "NASDAQ", nombre: "NASDAQ", habilitado: true },
  { id: "BVC", nombre: "Bolsa de Valores de Costa Rica", habilitado: false },
];

export const mockEmpresas: Empresa[] = [
  {
    id: "AAPL",
    nombre: "Apple Inc.",
    mercadoId: "NASDAQ",
    precioActual: 175.4,
    historicoPrecios: [{ fecha: "2025-10-12", valor: 175.4 }],
    cantidadTotal: 1000000,
    capitalizacion: 175000000,
    accionesDisponiblesTesoreria: 500000,
  },
  {
    id: "GOOG",
    nombre: "Alphabet Inc.",
    mercadoId: "NASDAQ",
    precioActual: 138.9,
    historicoPrecios: [{ fecha: "2025-10-12", valor: 138.9 }],
    cantidadTotal: 850000,
    capitalizacion: 118000000,
    accionesDisponiblesTesoreria: 300000,
  },
  {
    id: "BAC",
    nombre: "Bank of America",
    mercadoId: "NYSE",
    precioActual: 41.6,
    historicoPrecios: [{ fecha: "2025-10-12", valor: 41.6 }],
    cantidadTotal: 1200000,
    capitalizacion: 49920000,
    accionesDisponiblesTesoreria: 250000,
  },
];
