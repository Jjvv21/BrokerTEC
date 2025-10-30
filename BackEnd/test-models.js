import { User, Company, Market } from './scr/models/index.js';

// Datos de prueba
const userData = {
  id_usuario: 1,
  id_rol: 2,
  alias: 'trader01',
  nombre: 'Juan Pérez',
  correo: 'juan@test.com'
};

const user = new User(userData);
console.log('✅ User model creado:', user.toJSON());