const request = require('supertest');
const app = require('../../app');
const utilities = require('../../lib/utilities');

const routePrefix = '/api/v1/students';

jest.mock('../../data/classwork.json', () => require('../../data/mock/classwork.json'));
jest.mock('../../data/course.json', () => require('../../data/mock/course.json'));
jest.mock('../../data/student.json', () => require('../../data/mock/student.json'));

const mockStudentId = 123456;
const badFormatStudentId = 'abc123';
const nonStudentId = 111111;
const mockMp = 3;
const courseGradesData = require('../../data/mock/courseGrades.json');
const courseGradesAverageData = require('../../data/mock/courseGradesAverage.json');

describe('/routes/api/students.js', () => {
  describe('GET /', () => {
    test('return all student records', async () => {
      const response = await request(app).get(`${routePrefix}/`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toMatchObject([
        {
          id: 123456,
          name: 'Amber Lith',
          school: 'Big Middle School',
          studentUrl: 'http://localhost:3001/api/v1/students/123456'
        },
        {
          id: 234567,
          name: 'Ruby Lith',
          school: 'Big Elementary School',
          studentUrl: 'http://localhost:3001/api/v1/students/234567'
        }
      ]);
    });

    test('return 400 error if bad path param', async () => {
      const response = await request(app).get(`${routePrefix}/unknown_endpoint`);

      // TODO: revisit unhappy paths and assign proper status codes: https://httpstatuses.com/
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('GET /{mockStudentId})', () => {
    test('return student info', async () => {
      const response = await request(app).get(`${routePrefix}/${mockStudentId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        id: 123456,
        name: 'Amber Lith',
        classworkUrl: 'http://localhost:3001/api/v1/students/123456/classwork',
        gradesUrl: 'http://localhost:3001/api/v1/students/123456/grades',
        gradesAverageUrl: 'http://localhost:3001/api/v1/students/123456/grades/average'
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(`${routePrefix}/${badFormatStudentId}`);

      expect(response.statusCode).toEqual(400);
    });

    test('return empty object if no record for provided studentId', async () => {
      const response = await request(app).get(`${routePrefix}/${nonStudentId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({});
    });
  });

  describe('GET /{mockStudentId}/classwork)', () => {
    const mockClasswork = {
      assignment: 'Short Story',
      category: 'Assessment',
      comment: '',
      score: '95.00'
    };

    test('return all student classwork', async () => {
      const response = await request(app).get(`${routePrefix}/${mockStudentId}/classwork?mp=0`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(5);
      expect(response.body.assignments[0]).toMatchObject(mockClasswork);
    });

    test('return classwork for specific Marking Period', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudentId}/classwork?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(2);
      expect(response.body.assignments[0]).toMatchObject(mockClasswork);
    });

    test('return classwork for default Marking Period', async () => {
      jest.mock('../../lib/utilities');
      utilities.getMpForDate = () => mockMp;

      const response = await request(app).get(`${routePrefix}/${mockStudentId}/classwork`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments.length).toEqual(2);
      expect(response.body.assignments[0]).toMatchObject(mockClasswork);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(
        `${routePrefix}/${badFormatStudentId}/classwork?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(400);
    });

    test('return empty array if no record for provided studentId', async () => {
      const response = await request(app).get(
        `${routePrefix}/${nonStudentId}/classwork?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.assignments).toMatchObject([]);
    });
  });

  describe('GET /{mockStudentId}/grades)', () => {
    test('return student grades for specific Marking Period', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudentId}/grades?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.courseGrades).toMatchObject(courseGradesData);
    });

    test('return student grades for default Marking Period', async () => {
      jest.mock('../../lib/utilities');
      utilities.getMpForDate = () => mockMp;

      const response = await request(app).get(
        `${routePrefix}/${mockStudentId}/grades?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.courseGrades).toMatchObject(courseGradesData);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(
        `${routePrefix}/${badFormatStudentId}/grades?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(400);
    });

    test('return empty array if no record for provided studentId', async () => {
      const response = await request(app).get(`${routePrefix}/${nonStudentId}/grades?mp=${mockMp}`);

      expect(response.statusCode).toEqual(200);
      expect(Object.keys(response.body.courseGrades)).toHaveLength(0);
    });
  });

  describe('GET /{mockStudentId}/grades/average)', () => {
    test('return average of student course grade averages', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudentId}/grades/average?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.courseGradeAverage).toMatchObject(courseGradesAverageData);
    });

    test('return average of student course grade averages for default time', async () => {
      jest.mock('../../lib/utilities');
      utilities.getMpForDate = () => mockMp;

      const response = await request(app).get(`${routePrefix}/${mockStudentId}/grades/average`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.courseGradeAverage).toMatchObject(courseGradesAverageData);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(
        `${routePrefix}/${badFormatStudentId}/grades/average?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(400);
    });

    test('return undefined if no record for provided studentId', async () => {
      const response = await request(app).get(
        `${routePrefix}/${nonStudentId}/grades/average?mp=${mockMp}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.courseGradeAverage).toMatchObject([]);
    });
  });
});
