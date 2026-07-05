/**
 * Builds a new medical record object from vitals form state.
 * Pure function — no side effects, safe to unit test directly.
 *
 * @param {Object} form - Form field values (all optional strings)
 * @param {string} [form.heart_rate]
 * @param {string} [form.systolic]
 * @param {string} [form.diastolic]
 * @param {string} [form.oxygen]
 * @param {string} [form.sugar]
 * @param {string} [form.weight]
 * @param {Date} [now] - Overridable timestamp for testability
 * @returns {Object} New record with numeric fields and defaults applied
 */
export function buildNewRecord(form, now = new Date()) {
  return {
    id: `record-${now.getTime()}`,
    created_at: now.toISOString(),
    heart_rate: Number(form.heart_rate) || 76,
    blood_pressure_systolic: Number(form.systolic) || 120,
    blood_pressure_diastolic: Number(form.diastolic) || 80,
    oxygen_saturation: Number(form.oxygen) || 98,
    blood_sugar: Number(form.sugar) || 95,
    weight: Number(form.weight) || 72,
    liver_alt: 25,
    liver_ast: 23,
    kidney_creatinine: 0.95,
    kidney_bun: 17,
    cholesterol_total: 182,
    cholesterol_hdl: 52,
    cholesterol_ldl: 111
  };
}

/**
 * Formats a numeric vitals value for display.
 * Returns '—' when value is null, undefined, or NaN.
 *
 * @param {number|null|undefined} value
 * @param {string} [unit] - Optional unit suffix, e.g. 'bpm', '%'
 * @returns {string}
 */
export function formatVital(value, unit = '') {
  if (value == null || Number.isNaN(value)) return '—';
  return unit ? `${value} ${unit}` : String(value);
}

/**
 * Computes a simple summary from an array of records.
 *
 * @param {Object[]} records
 * @returns {{ avgHeartRate: number, latestWeight: number|null, entryCount: number }}
 */
export function summariseRecords(records) {
  if (!records.length) {
    return { avgHeartRate: 0, latestWeight: null, entryCount: 0 };
  }
  const avgHeartRate = Math.round(
    records.reduce((sum, r) => sum + (r.heart_rate || 0), 0) / records.length
  );
  const latestWeight = records[0]?.weight ?? null;
  return { avgHeartRate, latestWeight, entryCount: records.length };
}
