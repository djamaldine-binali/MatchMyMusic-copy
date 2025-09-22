// E2E smoke test to validate API is reachable during Jest e2e runs
const request = require('supertest');
const app = require('../../index');

describe('E2E - API Smoke', () => {
  test('GET /api/test returns 200 and success payload', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });
});


