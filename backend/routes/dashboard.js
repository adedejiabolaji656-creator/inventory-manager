import { Router } from 'express';
import { getDashboard, getCharts } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getDashboard);
router.get('/charts', getCharts);

export default router;
