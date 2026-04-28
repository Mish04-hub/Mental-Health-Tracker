const request = require('supertest');
const app = require('../app');

describe('API Test', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });
});