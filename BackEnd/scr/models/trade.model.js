export class Trade {
  constructor(tradeData) {
    this.id = tradeData.id_tx;
    this.usuarioId = tradeData.id_usuario;
    this.empresaId = tradeData.id_empresa;
    this.tipo = tradeData.tipo; // 'compra', 'venta', 'liquidacion'
    this.cantidad = tradeData.cantidad;
    this.precio = tradeData.precio;
    this.fecha = tradeData.fecha;
  }
}