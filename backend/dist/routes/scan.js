"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanController_1 = require("../controllers/scanController");
const portController_1 = require("../controllers/portController");
const historyController_1 = require("../controllers/historyController");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const scanLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many scan requests, slow down' },
});
router.post('/url', auth_1.protect, scanLimiter, scanController_1.scanUrl);
router.post('/email', auth_1.protect, scanLimiter, scanController_1.scanEmail);
router.post('/ports', auth_1.protect, scanLimiter, portController_1.scanPorts);
router.get('/history', auth_1.protect, historyController_1.getScanHistory);
router.get('/history/:id', auth_1.protect, historyController_1.getScanById);
exports.default = router;
