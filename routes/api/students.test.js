const request = require('supertest');
const app = require('../../app');
const utilities = require('../../lib/utilities');

const routePrefix = '/api/v1/students';

jest.mock('../../data/classwork.json', () => require('../../data/mock/classwork.json'));
jest.mock('../../data/course.json', () => require('../../data/mock/course.json'));
jest.mock('../../data/student.json', () => require('../../data/mock/student.json'));

const studentId = '123456';
const schoolYear = utilities.getSchoolYear('2020');
const runId = 3;
const classworkData = require('../../data/mock/classwork.json');
const courseGradesData = require('../../data/mock/courseGrades.json');
const courseGradesAverageData = require('../../data/mock/courseGradesAverage.json');

describe('/routes/api/students.js', () => {
  describe('GET /', () => {
    test('should GET all student records', async () => {
      const response = await request(app).get(`${routePrefix}/`);

      expect(response.statusCode).toEqual(200);
    });

    test('should return error code if bad path param', async () => {
      const response = await request(app).get(`${routePrefix}/unknown_endpoint`);

      // TODO: revisit unhappy paths and assign proper status codes: https://httpstatuses.com/
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('GET /{studentId})', () => {
    test('should GET student info', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        id: '123456',
        name: 'Amber Lith',
        assignments_url: 'http://localhost:3001/api/v1/students/123456/assignments',
        grades_url: 'http://localhost:3001/api/v1/students/123456/grades',
        grades_average_url: 'http://localhost:3001/api/v1/students/123456/grades/average'
      });
    });
  });

  describe('GET /{studentId}/classwork)', () => {
    const mockClasswork = {
      assignment: 'Short Story',
      category: 'Assessment',
      comment: '',
      score: '95.00'
    };

    test('should GET all student classwork', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}/classwork?run=0`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(4);
      expect(response.body.assignments[0]).toMatchObject(mockClasswork);
    });

    test('should GET classwork for specific Marking Period', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}/classwork?run=${runId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(2);
      expect(response.body.assignments[0]).toMatchObject(mockClasswork);
    });
  });

  describe('GET /{studentId}/grades)', () => {
    test('should GET student grades for specific Marking Period', async () => {
      const response = await request(app).get(`${routePrefix}/${studentId}/grades?run=${runId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.course_grades).toMatchObject(courseGradesData);
    });
  });

  describe('GET /{studentId}/grades/average)', () => {
    test('should GET average of student course grade averages', async () => {
      const response = await request(app).get(
        `${routePrefix}/${studentId}/grades/average?run=${runId}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.course_grade_average).toMatchObject(courseGradesAverageData);
    });
  });
});
