import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const passwordUtils = {
  hashPassword: async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },
  
  verifyPassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },
  
  generateRandomPassword: (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};