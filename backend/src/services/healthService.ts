import { pool } from '../config/db';

export interface DatabaseHealth {
  connected: boolean;
  serverTime: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const result = await pool.query<{ now: Date }>('SELECT NOW() as now');
  return {
    connected: true,
    serverTime: result.rows[0].now.toISOString(),
  };
}
