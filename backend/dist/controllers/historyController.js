"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScanById = exports.getScanHistory = void 0;
const zod_1 = require("zod");
const ScanHistory_1 = __importDefault(require("../models/ScanHistory"));
// GET /api/scan/history
const getScanHistory = async (req, res) => {
    const schema = zod_1.z.object({
        module: zod_1.z.enum(['url', 'email', 'port', 'password', 'file-encryption', 'all']).optional().default('all'),
        page: zod_1.z.string().regex(/^\d+$/).optional().default('1'),
        limit: zod_1.z.string().regex(/^\d+$/).optional().default('10'),
        search: zod_1.z.string().max(200).optional(),
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }
    const { module, page, limit, search } = parsed.data;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const filter = { userId: req.userId };
    if (module !== 'all')
        filter.module = module;
    if (search)
        filter.input = { $regex: search, $options: 'i' };
    const [items, total] = await Promise.all([
        ScanHistory_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('module verdict riskScore createdAt input'),
        ScanHistory_1.default.countDocuments(filter),
    ]);
    res.json({
        success: true,
        items,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    });
};
exports.getScanHistory = getScanHistory;
// GET /api/scan/history/:id
const getScanById = async (req, res) => {
    const item = await ScanHistory_1.default.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
        res.status(404).json({ success: false, message: 'Scan record not found' });
        return;
    }
    res.json({ success: true, item });
};
exports.getScanById = getScanById;
