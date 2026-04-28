test('basic addition works', () => {
    expect(2 + 2).toBe(4);
  });


  
  const request = require('supertest');
  const app = require('../app');
  
  describe('API Test', () => {
    it('GET / should return 200', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });
  });