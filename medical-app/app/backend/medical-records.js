export const MEDICAL_RECORD_COLUMNS = [
  'id',
  'created_at',
  'heart_rate',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'oxygen_saturation',
  'blood_sugar',
  'weight',
  'liver_alt',
  'liver_ast',
  'kidney_creatinine',
  'kidney_bun',
  'cholesterol_total',
  'cholesterol_hdl',
  'cholesterol_ldl'
];

export function buildMedicalRecordInsertValues(body, now = new Date()) {
  return [
    body.id ?? `record-${now.getTime()}`,
    body.created_at ?? now.toISOString(),
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
    body.cholesterol_ldl ?? null
  ];
}