// test-services.js
import { AuthService } from './scr/services/auth.service.js';
import { TraderService } from './scr/services/trader.service.js';
import { AdminService } from './scr/services/admin.service.js';
import { AnalystService } from './scr/services/analyst.service.js';
import { UtilsService } from './scr/services/utils.service.js';
import { logger } from './scr/config/logger.js';

async function testAllServices() {
  try {
    logger.info('🧪 Iniciando pruebas de todos los servicios');

    // 1. AuthService
    console.log('\n=== 🔐 Probando AuthService ===');
    const authService = new AuthService();
    const user = await authService.getUserById(2);
    console.log('✅ Usuario obtenido:', user?.alias);

    // 2. AdminService
    console.log('\n=== 👑 Probando AdminService ===');
    const adminService = new AdminService();
    const companies = await adminService.getAllCompanies();
    const users = await adminService.getAllUsers();
    console.log(`✅ Empresas: ${companies.length}, Usuarios: ${users.length}`);

    // 3. TraderService
    console.log('\n=== 💼 Probando TraderService ===');
    const traderService = new TraderService();
    const portfolio = await traderService.getPortfolio(2);
    const history = await traderService.getTransactionHistory(2);
    console.log(`✅ Portafolio: ${portfolio.length} posiciones, Historial: ${history.length} transacciones`);

    // 4. AnalystService
    console.log('\n=== 📊 Probando AnalystService ===');
    const analystService = new AnalystService();
    const stats = await analystService.getHoldingsStats();
    const topTraders = await analystService.getTopTraders();
    console.log(`✅ Estadísticas: ${stats.length} empresas, Top traders: ${topTraders.length}`);

    // 5. UtilsService
    console.log('\n=== 🛠️ Probando UtilsService ===');
    const utilsService = new UtilsService();
    const isValidEmail = utilsService.isValidEmail('test@example.com');
    const maxBuyable = utilsService.calculateMaxBuyable(1000, 50, 100);
    console.log(`✅ Email válido: ${isValidEmail}, Máximo comprable: ${maxBuyable}`);

    logger.info('🎉 Todas las pruebas completadas exitosamente');

  } catch (error) {
    logger.error('❌ Error en pruebas de servicios', error);
    console.error('Error detallado:', error.message);
  }
}

testAllServices();