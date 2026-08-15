import { Router } from 'express';
import { stockIn, stockOut, getMovements } from '../controllers/stockController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/in', stockIn);
router.post('/out', stockOut);
router.get('/', getMovements);

export default router;
