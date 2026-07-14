const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  test('debe indicar que la aplicación está funcionando', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('UP');
  });
});