export class Company {
  constructor(companyData) {
    this.id = companyData.id_empresa;
    this.mercadoId = companyData.id_mercado;
    this.nombre = companyData.nombre;
    this.precioActual = companyData.precio_actual;
    this.cantidadAcciones = companyData.cantidad_acciones;
    this.marketCap = companyData.market_cap;
    this.activo = companyData.activo;
  }
}