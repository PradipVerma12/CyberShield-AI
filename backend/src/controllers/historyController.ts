import { Response } from 'express';
import { z } from 'zod';
import ScanHistory from '../models/ScanHistory';
import { AuthRequest } from '../middleware/auth';

// GET /api/scan/history
export const getScanHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    module: z.enum(['url', 'email', 'port', 'password', 'file-encryption', 'all']).optional().default('all'),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    search: z.string().max(200).optional(),
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

  const filter: Record<string, unknown> = { userId: req.userId };
  if (module !== 'all') filter.module = module;
  if (search) filter.input = { $regex: search, $options: 'i' };

  const [items, total] = await Promise.all([
    ScanHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('module verdict riskScore createdAt input'),
    ScanHistory.countDocuments(filter),
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

// GET /api/scan/history/:id
export const getScanById = async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await ScanHistory.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) {
    res.status(404).json({ success: false, message: 'Scan record not found' });
    return;
  }
  res.json({ success: true, item });
};
