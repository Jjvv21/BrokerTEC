export class Position {
  constructor(positionData) {
    this.id = positionData.id_portafolio;
    this.usuarioId = positionData.id_usuario;
    this.empresaId = positionData.id_empresa;
    this.mercadoId = positionData.id_mercado;
    this.cantidad = positionData.cantidad;
    this.costoPromedio = positionData.costo_promedio;
  }
}