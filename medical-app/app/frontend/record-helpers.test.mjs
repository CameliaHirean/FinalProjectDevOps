import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNewRecord,
  formatVital,
  summariseRecords
} from './record-helpers.js';

// ── buildNewRecord ──────────────────────────────────────────────

test('buildNewRecord: uses form values when provided', () => {
  const now = new Date('2026-06-21T10:00:00.000Z');

  const record = buildNewRecord(
    { heart_rate: '80', systolic: '130', diastolic: '85',
      oxygen: '97', sugar: '100', weight: '75' },
    now
  );

  assert.strictEqual(record.id, `record-${now.getTime()}`);
  assert.strictEqual(record.created_at, now.toISOString());
  assert.strictEqual(record.heart_rate, 80);
  assert.strictEqual(record.blood_pressure_systolic, 130);
  assert.strictEqual(record.blood_pressure_diastolic, 85);
  assert.strictEqual(record.oxygen_saturation, 97);
  assert.strictEqual(record.blood_sugar, 100);
  assert.strictEqual(record.weight, 75);
});

test('buildNewRecord: applies defaults for empty form', () => {
  const now = new Date('2026-06-21T10:00:00.000Z');

  const record = buildNewRecord({}, now);

  assert.strictEqual(record.heart_rate, 76);
  assert.strictEqual(record.blood_pressure_systolic, 120);
  assert.strictEqual(record.blood_pressure_diastolic, 80);
  assert.strictEqual(record.oxygen_saturation, 98);
  assert.strictEqual(record.blood_sugar, 95);
  assert.strictEqual(record.weight, 72);
});

test('buildNewRecord: applies defaults for zero/empty string inputs', () => {
  const now = new Date('2026-06-21T10:00:00.000Z');

  const record = buildNewRecord(
    { heart_rate: '', systolic: '0', diastolic: undefined },
    now
  );

  // empty string and 0 are falsy → default applied
  assert.strictEqual(record.heart_rate, 76);
  assert.strictEqual(record.blood_pressure_systolic, 120);
  assert.strictEqual(record.blood_pressure_diastolic, 80);
});

test('buildNewRecord: includes all required medical fields', () => {
  const record = buildNewRecord({});

  const requiredFields = [
    'id', 'created_at',
    'heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic',
    'oxygen_saturation', 'blood_sugar', 'weight',
    'liver_alt', 'liver_ast', 'kidney_creatinine', 'kidney_bun',
    'cholesterol_total', 'cholesterol_hdl', 'cholesterol_ldl'
  ];

  for (const field of requiredFields) {
    assert.ok(field in record, `Missing field: ${field}`);
  }
  assert.strictEqual(Object.keys(record).length, requiredFields.length);
});

// ── formatVital ─────────────────────────────────────────────────

test('formatVital: formats a number without unit', () => {
  assert.strictEqual(formatVital(76), '76');
});

test('formatVital: formats a number with unit', () => {
  assert.strictEqual(formatVital(98, '%'), '98 %');
});

test('formatVital: returns dash for null', () => {
  assert.strictEqual(formatVital(null), '—');
});

test('formatVital: returns dash for undefined', () => {
  assert.strictEqual(formatVital(undefined), '—');
});

test('formatVital: returns dash for NaN', () => {
  assert.strictEqual(formatVital(NaN), '—');
});

// ── summariseRecords ─────────────────────────────────────────────

test('summariseRecords: returns zeros for empty array', () => {
  const result = summariseRecords([]);
  assert.deepStrictEqual(result, { avgHeartRate: 0, latestWeight: null, entryCount: 0 });
});

test('summariseRecords: computes correct averages', () => {
  const records = [
    { heart_rate: 80, weight: 72 },
    { heart_rate: 70, weight: 70 },
    { heart_rate: 90, weight: 74 }
  ];

  const result = summariseRecords(records);
  assert.strictEqual(result.avgHeartRate, 80);
  assert.strictEqual(result.latestWeight, 72);  // first record = latest
  assert.strictEqual(result.entryCount, 3);
});

test('summariseRecords: handles missing heart_rate gracefully', () => {
  const records = [
    { heart_rate: null, weight: 70 },
    { weight: 68 }
  ];

  const result = summariseRecords(records);
  assert.strictEqual(result.avgHeartRate, 0);
  assert.strictEqual(result.entryCount, 2);
});
