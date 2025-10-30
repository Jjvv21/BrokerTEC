import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'brokertec_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const jwtUtils = {
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },
  
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  },
  
  decodeToken: (token) => {
    return jwt.decode(token);
  }
};