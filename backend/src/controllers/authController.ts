import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_ACCESS_SECRET!;
  return jwt.sign({ userId }, secret, { expiresIn: '15m' });
};

const generateRefreshToken = (userId: string, rememberMe: boolean): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign({ userId }, secret, { expiresIn: rememberMe ? '30d' : '7d' });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString(), false);
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.status(201).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, password, rememberMe } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString(), rememberMe);

  // Keep max 5 refresh tokens per user (prune oldest)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ success: false, message: 'Refresh token required' });
    return;
  }

  try {
    const secret = process.env.JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(refreshToken, secret) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString(), false);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken && req.userId) {
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await user.save();
    }
  }

  res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, user });
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    name: z.string().min(2).max(50).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const user = await User.findByIdAndUpdate(req.userId, parsed.data, { new: true });
  res.json({ success: true, user });
};

// PUT /api/auth/change-password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log('Change password payload received for userId:', req.userId);
  const schema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'New password must contain at least one number'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join('; ');
    console.error('Change password validation error:', errorMsg);
    res.status(400).json({ success: false, message: errorMsg, errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isMatch = await user.comparePassword(parsed.data.currentPassword);
  if (!isMatch) {
    console.warn(`Change password failed for user ${user.email}: current password incorrect`);
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  user.refreshTokens = [];
  await user.save();

  console.log(`Password successfully updated for user ${user.email}`);
  res.json({ success: true, message: 'Password changed successfully' });
};

// PUT /api/auth/2fa-toggle
export const toggle2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save();
  res.json({
    success: true,
    twoFactorEnabled: user.twoFactorEnabled,
    message: `2FA ${user.twoFactorEnabled ? 'enabled' : 'disabled'} (UI demo mode — no real TOTP configured)`,
  });
};
