import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    const databaseUrl = new URL(process.env.DATABASE_URL);

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: databaseUrl.hostname.includes('supabase.co')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  return pool;
}

async function ensureTable() {
  const db = getPool();

  if (!db) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = await db.connect();

  try {
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
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const db = getPool();

    if (!db) {
      return NextResponse.json([]);
    }

    await ensureTable();

    const result = await db.query(
      `SELECT * FROM medical_records ORDER BY created_at DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch records:', error);
    return NextResponse.json(
      { error: 'Unable to load records from PostgreSQL' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = getPool();

    if (!db) {
      return NextResponse.json(
        { error: 'DATABASE_URL is not configured' },
        { status: 503 }
      );
    }

    await ensureTable();

    const body = await request.json();

    const values = [
      body.id ?? `record-${Date.now()}`,
      body.created_at ?? new Date().toISOString(),
      body.heart_rate ?? null,
      body.blood_pressure_systolic ?? null,
      body.blood_pressure_diastolic ?? null,
      body.oxygen_saturation ?? null,
      body.blood_sugar ?? null,
      body.weight ?? null,
      body.liver_alt ?? null,
      body.liver_ast ?? null,
      body.kidney_creatinine ?? null,
      body.kidney_bun ?? null,
      body.cholesterol_total ?? null,
      body.cholesterol_hdl ?? null,
      body.cholesterol_ldl ?? null,
    ];

    const result = await db.query(
      `INSERT INTO medical_records (
        id,
        created_at,
        heart_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        oxygen_saturation,
        blood_sugar,
        weight,
        liver_alt,
        liver_ast,
        kidney_creatinine,
        kidney_bun,
        cholesterol_total,
        cholesterol_hdl,
        cholesterol_ldl
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to save record:', error);
    return NextResponse.json(
      { error: 'Unable to save record to PostgreSQL' },
      { status: 500 }
    );
  }
}
