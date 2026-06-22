import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMedicalRecordInsertValues,
  MEDICAL_RECORD_COLUMNS
} from './medical-records.js';

test('buildMedicalRecordInsertValues preserves explicit values', () => {
  const now = new Date('2026-06-20T12:34:56.000Z');

  const values = buildMedicalRecordInsertValues(
    {
      id: 'record-123',
      created_at: '2026-06-19T00:00:00.000Z',
      heart_rate: 72,
      blood_pressure_systolic: 118,
      blood_pressure_diastolic: 76,
      oxygen_saturation: 99,
      blood_sugar: 92,
      weight: 70,
      liver_alt: 22,
      liver_ast: 21,
      kidney_creatinine: 0.88,
      kidney_bun: 15,
      cholesterol_total: 176,
      cholesterol_hdl: 57,
      cholesterol_ldl: 104
    },
    now
  );

  assert.deepStrictEqual(values, [
    'record-123',
    '2026-06-19T00:00:00.000Z',
    72,
    118,
    76,
    99,
    92,
    70,
    22,
    21,
    0.88,
    15,
    176,
    57,
    104
  ]);
});

test('buildMedicalRecordInsertValues fills defaults', () => {
  const now = new Date('2026-06-20T12:34:56.000Z');

  const values = buildMedicalRecordInsertValues({}, now);

  assert.deepStrictEqual(values, [
    'record-1781958896000',
    '2026-06-20T12:34:56.000Z',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ]);
});

// ── MEDICAL_RECORD_COLUMNS ───────────────────────────────────────

test('MEDICAL_RECORD_COLUMNS: has exactly 15 columns', () => {
  assert.strictEqual(MEDICAL_RECORD_COLUMNS.length, 15);
});

test('MEDICAL_RECORD_COLUMNS: id is the first column', () => {
  assert.strictEqual(MEDICAL_RECORD_COLUMNS[0], 'id');
});

test('MEDICAL_RECORD_COLUMNS: contains all expected fields', () => {
  const expected = [
    'id', 'created_at', 'heart_rate',
    'blood_pressure_systolic', 'blood_pressure_diastolic',
    'oxygen_saturation', 'blood_sugar', 'weight',
    'liver_alt', 'liver_ast', 'kidney_creatinine', 'kidney_bun',
    'cholesterol_total', 'cholesterol_hdl', 'cholesterol_ldl'
  ];
  assert.deepStrictEqual(MEDICAL_RECORD_COLUMNS, expected);
});

// ── buildMedicalRecordInsertValues — edge cases ──────────────────

test('buildMedicalRecordInsertValues: returns 15 values (matches column count)', () => {
  const values = buildMedicalRecordInsertValues({});
  assert.strictEqual(values.length, MEDICAL_RECORD_COLUMNS.length);
});

test('buildMedicalRecordInsertValues: null fields stay null', () => {
  const now = new Date('2026-06-21T10:00:00.000Z');
  const values = buildMedicalRecordInsertValues(
    { id: 'x', heart_rate: null },
    now
  );
  assert.strictEqual(values[2], null); // heart_rate
});

test('buildMedicalRecordInsertValues: generated id uses timestamp', () => {
  const now = new Date('2026-06-21T10:00:00.000Z');
  const values = buildMedicalRecordInsertValues({}, now);
  assert.strictEqual(values[0], `record-${now.getTime()}`);
});

test('buildMedicalRecordInsertValues: explicit created_at is preserved', () => {
  const now = new Date('2026-06-21T10:00:00.000Z');
  const ts = '2025-01-01T00:00:00.000Z';
  const values = buildMedicalRecordInsertValues({ created_at: ts }, now);
  assert.strictEqual(values[1], ts);
});
