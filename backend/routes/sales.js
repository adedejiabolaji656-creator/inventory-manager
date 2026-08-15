import { Router } from 'express';
import { getSales, getSale, createSale } from '../controllers/saleController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/').get(getSales).post(createSale);
router.route('/:id').get(getSale);

export default router;
