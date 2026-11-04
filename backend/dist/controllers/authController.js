"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle2FA = exports.changePassword = exports.updateProfile = exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = __importDefault(require("../models/User"));
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Must contain uppercase')
        .regex(/[0-9]/, 'Must contain number'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
const generateAccessToken = (userId) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: '15m' });
};
const generateRefreshToken = (userId, rememberMe) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: rememberMe ? '30d' : '7d' });
};
// POST /api/auth/register
const register = async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    const { name, email, password } = parsed.data;
    const existing = await User_1.default.findOne({ email });
    if (existing) {
        res.status(409).json({ success: false, message: 'Email already registered' });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await User_1.default.create({ name, email, passwordHash });
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
exports.register = register;
// POST /api/auth/login
const login = async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    const { email, password, rememberMe } = parsed.data;
    const user = await User_1.default.findOne({ email });
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
exports.login = login;
// POST /api/auth/refresh
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token required' });
        return;
    }
    try {
        const secret = process.env.JWT_REFRESH_SECRET;
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        const user = await User_1.default.findById(decoded.userId);
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
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};
exports.refresh = refresh;
// POST /api/auth/logout
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken && req.userId) {
        const user = await User_1.default.findById(req.userId);
        if (user) {
            user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
            await user.save();
        }
    }
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
// GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User_1.default.findById(req.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, user });
};
exports.getMe = getMe;
// PUT /api/auth/profile
const updateProfile = async (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2).max(50).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    const user = await User_1.default.findByIdAndUpdate(req.userId, parsed.data, { new: true });
    res.json({ success: true, user });
};
exports.updateProfile = updateProfile;
// PUT /api/auth/change-password
const changePassword = async (req, res) => {
    console.log('Change password payload received for userId:', req.userId);
    const schema = zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z
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
    const user = await User_1.default.findById(req.userId);
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
    user.passwordHash = await bcryptjs_1.default.hash(parsed.data.newPassword, 12);
    user.refreshTokens = [];
    await user.save();
    console.log(`Password successfully updated for user ${user.email}`);
    res.json({ success: true, message: 'Password changed successfully' });
};
exports.changePassword = changePassword;
// PUT /api/auth/2fa-toggle
const toggle2FA = async (req, res) => {
    const user = await User_1.default.findById(req.userId);
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
exports.toggle2FA = toggle2FA;
