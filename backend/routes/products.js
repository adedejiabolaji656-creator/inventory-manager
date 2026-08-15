import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/').get(getProducts).post(createProduct);
router.get('/categories', getCategories);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

export default router;
