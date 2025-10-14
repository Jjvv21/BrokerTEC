// ======================================================
//  Tipos base del proyecto BrokerTEC (frontend)
// ======================================================

// Roles válidos del sistema
export type Rol = "Trader" | "Admin" | "Analista";

// Categorías de trader (afectan el límite diario de recarga)
export type Categoria = "junior" | "mid" | "senior";

// ======================================================
//  Usuarios
// ======================================================

export interface Usuario {
  id: string;

  // Autenticación
  usuario: string;          // nombre de usuario (para login)
  contrasena: string;       // hash simulado (por ahora texto)

  // Información personal
  alias: string;            // identificador público único
  nombre: string;
  correo: string;
  telefono: string;
  direccion?: string;
  pais: string;

  // Rol y estado
  rol: Rol;
  estado: "activo" | "deshabilitado";

  // Datos financieros (solo Trader, pero dejamos opcional)
  wallet: Wallet;
  portafolio?: PortafolioItem[];

  // Auditoría / metadatos
  ultimaConexion?: string;  // ISO string
}

// ======================================================
//  Wallet (cuenta USD)
// ======================================================

export interface Wallet {
  saldo: number;           // efectivo disponible
  categoria: Categoria;    // afecta límite diario
  limiteDiario: number;    // máximo top-up permitido por día
  consumoHoy: number;      // cuánto ha recargado hoy
  historialRecargas: Recarga[];
}

// Historial de recargas (top-ups)
export interface Recarga {
  id: string;
  monto: number;
  fecha: string;           // ISO
}

// ======================================================
//  Empresas y Mercados
// ======================================================

export interface Mercado {
  id: string;
  nombre: string;
  habilitado: boolean;
  moneda: "USD";           // por requerimiento
}

export interface Empresa {
  id: string;
  nombre: string;
  mercadoId: string;
  cantidadTotal: number;   // total de acciones emitidas
  precioActual: number;
  preciosAnteriores: PrecioHistorico[];
  inventarioTesoreria: number; // acciones disponibles (Tesorería)
}

// Histórico de precios
export interface PrecioHistorico {
  fecha: string;  // ISO
  precio: number;
}

// ======================================================
//  Portafolio y posiciones
// ======================================================

export interface PortafolioItem {
  empresaId: string;
  empresaNombre: string;
  mercadoId: string;
  cantidad: number;
  costoPromedio: number;
  precioActual: number;
  valorActual: number;   // cantidad * precioActual
}

// ======================================================
//  Transacciones (compras/ventas)
// ======================================================

export interface Transaccion {
  id: string;
  usuarioAlias: string;     // visible solo para analista
  empresaId: string;
  empresaNombre: string;
  tipo: "compra" | "venta";
  cantidad: number;
  precio: number;
  timestamp: string;        // ISO
}

// ======================================================
//  Utilidades para reportes (Analista / Admin)
// ======================================================

export interface EstadisticaTenencia {
  empresaId: string;
  empresaNombre: string;
  porcentajeTraders: number;
  porcentajeAdministracion: number;
}
