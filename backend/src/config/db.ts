import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Define it in backend/.env');
}

// Return DATE columns (OID 1082) as plain 'YYYY-MM-DD' strings. By default pg
// turns them into a local-midnight JS Date, which JSON-serializes to a UTC
// timestamp that lands on the previous day in timezones ahead of UTC (IST:
// 2026-10-07 -> 2026-10-06T18:30:00.000Z). A DATE has no time or zone, so the
// string is returned untouched. TIMESTAMPTZ columns are unaffected.
types.setTypeParser(1082, (value: string) => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
