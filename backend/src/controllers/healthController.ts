import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../services/healthService';
import { logger } from '../utils/logger';

export function getHealth(_req: Request, res: Response) {
  res.json({
    success: true,
    message: 'MaaSuraksha API is running',
  });
}

export async function getDatabaseHealth(_req: Request, res: Response) {
  try {
    const health = await checkDatabaseHealth();
    res.json({
      success: true,
      message: 'Neon database connection is healthy',
      ...health,
    });
  } catch (error) {
    logger.error('Database health check failed', error);
    res.status(503).json({
      success: false,
      message: 'Neon database connection failed',
    });
  }
}
