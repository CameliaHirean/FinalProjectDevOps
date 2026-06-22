import { Pool } from 'pg';

function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for database verification');
  }

  const databaseUrl = new URL(connectionString);

  return new Pool({
    connectionString,
    ssl: databaseUrl.hostname.includes('supabase.co')
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

async function run() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');

    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        heart_rate DOUBLE PRECISION,
        blood_pressure_systolic DOUBLE PRECISION,
        blood_pressure_diastolic DOUBLE PRECISION,
        oxygen_saturation DOUBLE PRECISION,
        blood_sugar DOUBLE PRECISION,
        weight DOUBLE PRECISION,
        liver_alt DOUBLE PRECISION,
        liver_ast DOUBLE PRECISION,
        kidney_creatinine DOUBLE PRECISION,
        kidney_bun DOUBLE PRECISION,
        cholesterol_total DOUBLE PRECISION,
        cholesterol_hdl DOUBLE PRECISION,
        cholesterol_ldl DOUBLE PRECISION
      )
    `);

    const tableCheck = await client.query(
      "SELECT to_regclass('public.medical_records') AS table_name"
    );

    if (!tableCheck.rows[0]?.table_name) {
      throw new Error('medical_records table verification failed');
    }

    console.log('Database verification passed');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Database verification failed:', error.message);
  process.exit(1);
});