import { Router } from 'express';
import apiRoutes from './api-routes.js';
import ejsRoutes from './ejs-routes.js';
import authRoutes from './auth.js';


const router = Router();

// API Auth

router.use('/', authRoutes);

// API routes
router.use('/api', apiRoutes);

// EJS routes
router.use('/', ejsRoutes);



export default router;
