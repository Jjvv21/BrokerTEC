export class Treasury {
  constructor(treasuryData) {
    this.id = treasuryData.id_tesoreria;
    this.empresaId = treasuryData.id_empresa;
    this.accionesDisponibles = treasuryData.acciones_disponibles;
  }
}