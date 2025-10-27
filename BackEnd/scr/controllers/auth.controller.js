import * as AuthService from '../services/auth.service.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const userData = req.body;
    const result = await AuthService.register(userData);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await AuthService.verifyToken(token);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};