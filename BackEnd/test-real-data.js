import { AdminService, AnalystService } from './scr/services/index.js';

async function testRealData() {
  try {
    const adminService = new AdminService();
    const companies = await adminService.getAllCompanies();
    console.log('📊 Empresas reales:', companies.map(c => c.nombre));

    const analystService = new AnalystService();
    const stats = await analystService.getHoldingsStats();
    console.log('📈 Estadísticas:', stats);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRealData();