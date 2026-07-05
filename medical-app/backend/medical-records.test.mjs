import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMedicalRecordInsertValues } from './medical-records.js';

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