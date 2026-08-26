import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import motherRoutes from './motherRoutes';
import doctorRoutes from './doctorRoutes';
import hospitalRoutes from './hospitalRoutes';
import messageRoutes from './messageRoutes';
import testRoutes from './testRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mother', motherRoutes);
router.use('/doctor', doctorRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/messages', messageRoutes);
router.use('/test', testRoutes);

export default router;
