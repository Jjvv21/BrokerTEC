import { jwtUtils } from './scr/utils/jwt.js';
import { passwordUtils } from './scr/utils/password.js';
import { responseUtils } from './scr/utils/response.js';
import { USER_ROLES } from './scr/utils/constants.js';
import { AuthService } from './scr/services/auth.service.js';

async function testUtils() {
  try {
    console.log('🧪 Probando Utils...\n');

    // 1. Probar passwordUtils con usuario real
    console.log('1. 🔐 Probando passwordUtils...');
    const testPassword = 'mi_contraseña_segura';
    const hashedPassword = await passwordUtils.hashPassword(testPassword);
    const isValid = await passwordUtils.verifyPassword(testPassword, hashedPassword);
    console.log('✅ Password hash/verify:', isValid ? 'FUNCIONA' : 'FALLA');
    
    // 2. Probar jwtUtils con usuario real de BD
    console.log('\n2. 🔑 Probando jwtUtils...');
    const authService = new AuthService();
    const user = await authService.getUserById(2); // trader01
    
    if (user) {
      const token = jwtUtils.generateToken({ 
        userId: user.id, 
        alias: user.alias, 
        role: USER_ROLES.TRADER 
      });
      console.log('✅ Token generado:', token.substring(0, 50) + '...');
      
      const decoded = jwtUtils.verifyToken(token);
      console.log('✅ Token verificado para usuario:', decoded.alias);
    }

    // 3. Probar responseUtils
    console.log('\n3. 📨 Probando responseUtils...');
    const successResponse = responseUtils.success({ user: user?.alias }, 'Login exitoso');
    console.log('✅ Success response:', successResponse);
    
    const errorResponse = responseUtils.error('Usuario no encontrado', 404);
    console.log('✅ Error response:', errorResponse);

    // 4. Probar constants
    console.log('\n4. 📋 Probando constants...');
    console.log('✅ Roles:', USER_ROLES);
    console.log('✅ Usuario real rol:', user?.rolId === USER_ROLES.TRADER ? 'TRADER' : 'OTRO');

  } catch (error) {
    console.error('❌ Error probando utils:', error.message);
  }
}

testUtils();