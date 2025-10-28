export class PriceHistory {
  constructor(priceData) {
    this.id = priceData.id_hist;
    this.empresaId = priceData.id_empresa;
    this.precio = priceData.precio;
    this.fecha = priceData.fecha;
  }
}