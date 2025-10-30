export class Market {
  constructor(marketData) {
    this.id = marketData.id_mercado;
    this.nombre = marketData.nombre;
    this.estado = marketData.estado;
  }
}