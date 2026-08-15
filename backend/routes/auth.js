import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = Router();

router.post('/register', optionalProtect, register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
