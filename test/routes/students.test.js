const request = require('supertest');
const app = require('../../app');

const routePrefix = '/api/v1/students';

jest.mock('../../data/classwork.json', () => require('../mock/classwork.json'));
jest.mock('../../data/course.json', () => require('../mock/course.json'));
jest.mock('../../data/student.json', () => require('../mock/student.json'));

const studentId = 123456;
const runId = 3;
const classworkData = require('../mock/classwork.json');
const courseGradesData = require('../mock/courseGrades.json');
const courseGradesAverageData = require('../mock/courseGradesAverage.json');

const classwork = classworkData[studentId].classwork[0];

describe('/routes/students', () => {
  describe('GET /', () => {
    test('should GET all student records', async () => {
      const response = await request(app).get(`${routePrefix}/`);

      expect(response.statusCode).toEqual(200);
    });

    test('should return error code', async () => {
      const response = await request(app).get(`${routePrefix}/unknown_endpoint`);

      // TODO: revisit unhappy paths and assign proper status codes: https://httpstatuses.com/
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('GET /{studentId})', () => {
    test('should GET student info', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        id: '123456',
        name: 'Dick Smothers',
        assignments_url: 'http://localhost:3001/api/v1/students/123456/assignments{/runId}',
        grades_url: 'http://localhost:3001/api/v1/students/123456/grades{/runId}',
        grades_snapshot_url: 'http://localhost:3001/api/v1/students/123456/grades/snapshot{/runId}'
      });
    });
  });

  describe('GET /{studentId}/assignments)', () => {
    test('should GET student classwork assignments', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}/assignments`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(3);
      expect(response.body.assignments[0]).toMatchObject(classwork);
    });
  });

  describe('GET /{studentId}/assignments/{runId})', () => {
    test('should GET classwork for specific Marking Period', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}/assignments/${runId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(2);
      expect(response.body.assignments[0]).toMatchObject(classwork);
    });
  });

  describe('GET /{studentId}/grades/{runId})', () => {
    test('should GET student grades for specific Marking Period', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}/grades/${runId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.course_grades).toMatchObject(courseGradesData);
    });
  });

  describe('GET /{studentId}/grades/snapshot/{runId})', () => {
    test('should GET snapshot of student course grade averages', async () => {
      const response = await request(app).get(
        `${routePrefix}/${studentId}/grades/snapshot/${runId}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.course_grade_average).toMatchObject(courseGradesAverageData);
    });
  });
});
