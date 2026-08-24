import { pool } from '../config/db';

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as now');
    console.log('Neon PostgreSQL connection successful:', result.rows[0].now);
    process.exit(0);
  } catch (error) {
    console.error('Neon PostgreSQL connection failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
