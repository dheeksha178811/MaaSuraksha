import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function migrate() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: tsx src/scripts/migrate.ts <migration-file>.sql');
    process.exitCode = 1;
    return;
  }

  const filePath = path.join(MIGRATIONS_DIR, file);
  const sql = fs.readFileSync(filePath, 'utf-8');

  try {
    await pool.query(sql);
    console.log(`Migration applied successfully: ${file}`);
  } catch (error) {
    console.error(`Migration failed: ${file}`);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
