import * as UserService from '../services/user.service.js';

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await UserService.getUserProfile(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    const result = await UserService.updateUserProfile(userId, userData);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const result = await UserService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};