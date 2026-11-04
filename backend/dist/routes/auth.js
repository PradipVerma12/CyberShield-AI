"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/register', authLimiter, authController_1.register);
router.post('/login', authLimiter, authController_1.login);
router.post('/refresh', authController_1.refresh);
router.post('/logout', auth_1.protect, authController_1.logout);
router.get('/me', auth_1.protect, authController_1.getMe);
router.put('/profile', auth_1.protect, authController_1.updateProfile);
router.put('/change-password', auth_1.protect, authController_1.changePassword);
router.put('/2fa-toggle', auth_1.protect, authController_1.toggle2FA);
exports.default = router;
