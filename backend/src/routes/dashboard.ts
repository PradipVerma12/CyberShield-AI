import { Router } from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, getDashboardStats);
router.get('/activity', protect, getRecentActivity);

export default router;
