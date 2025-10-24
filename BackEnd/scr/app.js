
import { AuthService, TraderService } from './scr/services/index.js';

// Probar flujo completo
const authService = new AuthService();
const user = await authService.getUserById(2); // trader01
console.log('Usuario:', user.alias);

const traderService = new TraderService();
const portfolio = await traderService.getPortfolio(2);
console.log('Portafolio:', portfolio);