import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import motherRoutes from './motherRoutes';
import testRoutes from './testRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mother', motherRoutes);
router.use('/test', testRoutes);

export default router;
