import type {
  Usuario,
  Empresa,
  Mercado,
  Transaccion,
  PrecioHistorico,
  Wallet,
  PortafolioItem,
  Recarga,
} from "../models/types";

// ======================================================
// 🧍‍♂️ USUARIOS
// ======================================================

export const usuariosMock: Usuario[] = [
  {
    id: "1",
    usuario: "analop",
    contrasena: "trader123",
    alias: "ALopez",
    nombre: "Ana López",
    correo: "ana@example.com",
    telefono: "8888-1234",
    pais: "Costa Rica",
    rol: "Trader",
    estado: "activo",
    direccion: "Av. Central, San José",
    wallet: {
      saldo: 4200,
      categoria: "mid",
      limiteDiario: 2000,
      consumoHoy: 500,
      historialRecargas: [
        { id: "r1", monto: 1000, fecha: "2025-10-10T10:00:00Z" },
        { id: "r2", monto: 500, fecha: "2025-10-13T15:30:00Z" },
      ],
    },
    portafolio: [
      {
        empresaId: "E1",
        empresaNombre: "TechNova",
        mercadoId: "M1",
        cantidad: 30,
        costoPromedio: 90,
        precioActual: 95,
        valorActual: 2850,
      },
      {
        empresaId: "E2",
        empresaNombre: "GreenFuture",
        mercadoId: "M2",
        cantidad: 15,
        costoPromedio: 120,
        precioActual: 130,
        valorActual: 1950,
      },
    ],
    ultimaConexion: "2025-10-13T19:00:00Z",
  },
  {
    id: "2",
    usuario: "cmendez",
    contrasena: "admin123",
    alias: "CMendez",
    nombre: "Carlos Méndez",
    correo: "carlos@example.com",
    telefono: "8888-5678",
    pais: "Costa Rica",
    rol: "Admin",
    estado: "activo",
    wallet: {
      saldo: 0,
      categoria: "mid",
      limiteDiario: 0,
      consumoHoy: 0,
      historialRecargas: [],
    },
  },
  {
    id: "3",
    usuario: "ljimenez",
    contrasena: "analista123",
    alias: "LJimenez",
    nombre: "Laura Jiménez",
    correo: "laura@example.com",
    telefono: "8888-9999",
    pais: "Costa Rica",
    rol: "Analista",
    estado: "activo",
    wallet: {
      saldo: 0,
      categoria: "junior",
      limiteDiario: 0,
      consumoHoy: 0,
      historialRecargas: [],
    },
  },
];

// ======================================================
// 🏦 MERCADOS
// ======================================================

export const mercadosMock: Mercado[] = [
  { id: "M1", nombre: "NASDAQ", habilitado: true, moneda: "USD" },
  { id: "M2", nombre: "NYSE", habilitado: true, moneda: "USD" },
];

// ======================================================
// 🏢 EMPRESAS
// ======================================================

export const empresasMock: Empresa[] = [
  {
    id: "E1",
    nombre: "TechNova",
    mercadoId: "M1",
    cantidadTotal: 1000000,
    precioActual: 95,
    preciosAnteriores: [
      { fecha: "2025-10-10T00:00:00Z", precio: 92 },
      { fecha: "2025-10-11T00:00:00Z", precio: 94 },
      { fecha: "2025-10-12T00:00:00Z", precio: 95 },
    ],
    inventarioTesoreria: 15000,
  },
  {
    id: "E2",
    nombre: "GreenFuture",
    mercadoId: "M2",
    cantidadTotal: 500000,
    precioActual: 130,
    preciosAnteriores: [
      { fecha: "2025-10-10T00:00:00Z", precio: 120 },
      { fecha: "2025-10-11T00:00:00Z", precio: 125 },
      { fecha: "2025-10-12T00:00:00Z", precio: 130 },
    ],
    inventarioTesoreria: 20000,
  },
];

// ======================================================
// 💰 TRANSACCIONES
// ======================================================

export const transaccionesMock: Transaccion[] = [
  {
    id: "T1",
    usuarioAlias: "ALopez",
    empresaId: "E1",
    empresaNombre: "TechNova",
    tipo: "compra",
    cantidad: 20,
    precio: 90,
    timestamp: "2025-10-10T14:00:00Z",
  },
  {
    id: "T2",
    usuarioAlias: "ALopez",
    empresaId: "E2",
    empresaNombre: "GreenFuture",
    tipo: "compra",
    cantidad: 15,
    precio: 120,
    timestamp: "2025-10-11T10:30:00Z",
  },
  {
    id: "T3",
    usuarioAlias: "ALopez",
    empresaId: "E1",
    empresaNombre: "TechNova",
    tipo: "venta",
    cantidad: 5,
    precio: 95,
    timestamp: "2025-10-12T17:00:00Z",
  },
];

// ======================================================
// 📈 FUNCIONES DE UTILIDAD (mock helpers)
// ======================================================

// Top empresas por capitalización (para TraderHome)
export function getTopEmpresasPorCapitalizacion(): Empresa[] {
  return empresasMock
    .slice()
    .sort(
      (a, b) =>
        b.precioActual * b.cantidadTotal - a.precioActual * a.cantidadTotal
    )
    .slice(0, 5);
}

// Histórico de precios por empresa (para gráficos)
export function getPrecioSeries(empresaId: string): PrecioHistorico[] {
  const empresa = empresasMock.find((e) => e.id === empresaId);
  return empresa ? empresa.preciosAnteriores : [];
}

// Mayor tenedor por alias (para Analista)
export function getMayorTenedor(empresaId: string): string {
  // Solo mockeado: devolvemos el Trader si coincide
  return "ALopez";
}
