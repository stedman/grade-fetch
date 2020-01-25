const request = require('supertest');
const app = require('./app');

describe('/app.js', () => {
  describe('Found path', () => {
    test('should return 200', async () => {
      const response = await request(app).get(`/api/v1/students`);

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('Missing path', () => {
    test('should return 404', async () => {
      const response = await request(app).get(`/`);

      expect(response.statusCode).toEqual(404);
    });
  });

  describe('Bad request', () => {
    test('should return 400', async () => {
      const response = await request(app).get(`/api/v1/students/0`);

      expect(response.statusCode).toEqual(400);
    });
  });
});
