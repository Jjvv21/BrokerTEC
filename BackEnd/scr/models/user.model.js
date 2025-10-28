export class User {
  constructor(userData) {
    this.id = userData.id_usuario;
    this.rolId = userData.id_rol;
    this.categoriaId = userData.id_categoria;
    this.alias = userData.alias;
    this.estado = userData.estado;
    this.nombre = userData.nombre;
    this.correo = userData.correo;
    this.telefono = userData.telefono;
    this.direccion = userData.direccion;
    this.paisDeOrigen = userData.pais_de_origen;

    this.passwordHash = userData.contrasena_hash || userData.password_hash;
    this.lastAccess = userData.last_access;
  }

  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}