import { pool } from '../config/db';

const EXPECTED_TABLES = [
  'users',
  'mother_profiles',
  'doctor_profiles',
  'hospital_profiles',
  'admin_profiles',
  'child_profiles',
  'emergency_contacts',
  'patient_care_records',
];

async function verifySchema() {
  try {
    const tablesResult = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1)
       ORDER BY table_name`,
      [EXPECTED_TABLES]
    );
    const foundTables = tablesResult.rows.map((r) => r.table_name);

    console.log('--- Tables ---');
    for (const t of EXPECTED_TABLES) {
      console.log(`${foundTables.includes(t) ? '✔' : '✘'} ${t}`);
    }

    const fkResult = await pool.query<{
      table_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }>(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        AND tc.table_name = ANY($1)
      ORDER BY tc.table_name, kcu.column_name;
    `, [EXPECTED_TABLES]);

    console.log('\n--- Foreign Keys ---');
    for (const row of fkResult.rows) {
      console.log(`${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    }

    const missing = EXPECTED_TABLES.filter((t) => !foundTables.includes(t));
    if (missing.length > 0) {
      console.error(`\nMissing tables: ${missing.join(', ')}`);
      process.exitCode = 1;
    } else {
      console.log('\nAll 8 expected tables exist.');
    }
  } catch (error) {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

verifySchema();
