import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.STAGING_URL || 'http://localhost:3000';

test('GET /health returns 200', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.deepEqual(data, { status: 'ok' });
});

test('GET /api/hello returns 200', async () => {
  const res = await fetch(`${BASE_URL}/api/hello`);
  assert.equal(res.status, 200);
});

test('GET /api/records returns valid response', async () => {
  const res = await fetch(`${BASE_URL}/api/records`);
  // 200 (records returned) or 503 (db not configured) are both acceptable
  assert.ok(
    [200, 503].includes(res.status),
    `Expected 200 or 503, got ${res.status}`
  );
  if (res.status === 200) {
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Response body should be an array');
  }
});

test('POST /api/records with empty body returns 400 or 503', async () => {
  const res = await fetch(`${BASE_URL}/api/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.ok(
    [400, 503].includes(res.status),
    `Expected 400 or 503, got ${res.status}`
  );
});
