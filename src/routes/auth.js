
import { Router } from 'express';
import {
    register,
    login,
    logout,
} from '../controllers/auth.js';
import { requirePageLogin } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requirePageLogin, logout);

export default router;
