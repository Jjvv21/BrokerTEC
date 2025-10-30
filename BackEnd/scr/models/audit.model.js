export class Audit {
  constructor(auditData) {
    this.id = auditData.id_evento;
    this.usuarioId = auditData.id_usuario;
    this.adminId = auditData.id_admin;
    this.tipo = auditData.tipo; // 'deshabilitar', 'delistar', 'liquidar'
    this.justificacion = auditData.justificacion;
    this.fecha = auditData.fecha;
  }
}