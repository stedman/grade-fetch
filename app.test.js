const request = require('supertest');
const app = require('./app');

describe('/', () => {
  describe('GET /', () => {
    test('should return 404', async () => {
      const response = await request(app).get(`/`);

      expect(response.statusCode).toEqual(404);
    });
  });
});
