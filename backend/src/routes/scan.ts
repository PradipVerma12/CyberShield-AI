import { Router } from 'express';
import { scanUrl, scanEmail } from '../controllers/scanController';
import { scanPorts } from '../controllers/portController';
import { getScanHistory, getScanById } from '../controllers/historyController';
import { protect } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many scan requests, slow down' },
});

router.post('/url', protect, scanLimiter, scanUrl);
router.post('/email', protect, scanLimiter, scanEmail);
router.post('/ports', protect, scanLimiter, scanPorts);
router.get('/history', protect, getScanHistory);
router.get('/history/:id', protect, getScanById);

export default router;
