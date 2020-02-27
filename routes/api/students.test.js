const request = require('supertest');
const app = require('../../app');
const period = require('../../models/period');

const routePrefix = '/api/v1/students';

jest.mock('../../data/grades.json', () => require('../../data/mock/grades.json'));
jest.mock('../../data/student.json', () => require('../../data/mock/student.json'));

const mockStudent = {
  id: 123456,
  name: 'Amber Lith',
  id_failFormat: 'abc123',
  id_failFind: 111111
};
const mockPeriodIndex = 3;

describe('/routes/api/students.js', () => {
  describe('GET /', () => {
    test('return all student records', async () => {
      const response = await request(app).get(`${routePrefix}/`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toMatchObject([
        {
          id: mockStudent.id,
          name: mockStudent.name,
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

  describe('GET /{mockStudent.id})', () => {
    test('return student info', async () => {
      const response = await request(app).get(`${routePrefix}/${mockStudent.id}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        id: mockStudent.id,
        name: mockStudent.name,
        classworkUrl: 'http://localhost:3001/api/v1/students/123456/classwork',
        gradesUrl: 'http://localhost:3001/api/v1/students/123456/grades',
        gradesAverageUrl: 'http://localhost:3001/api/v1/students/123456/grades/average'
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(`${routePrefix}/${mockStudent.id_failFormat}`);

      expect(response.statusCode).toEqual(400);
    });

    test('return empty object if no record for provided studentId', async () => {
      const response = await request(app).get(`${routePrefix}/${mockStudent.id_failFind}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({});
    });
  });

  describe('GET /{mockStudent.id}/classwork)', () => {
    test('return all student classwork', async () => {
      const response = await request(app).get(`${routePrefix}/${mockStudent.id}/classwork?all`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('studentId', mockStudent.id);
      expect(response.body).toHaveProperty('studentName', mockStudent.name);
      expect(response.body).toHaveProperty('interval');
      expect(response.body).toHaveProperty('interval.start');
      expect(response.body).toHaveProperty('interval.end');
      expect(response.body).toHaveProperty('course');
    });

    test('return classwork for specific Marking Period', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id}/classwork?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('studentId', mockStudent.id);
      expect(response.body).toHaveProperty('studentName', mockStudent.name);
      expect(response.body).toHaveProperty('interval');
      expect(response.body).toHaveProperty('interval.start');
      expect(response.body).toHaveProperty('interval.end');
      expect(response.body).toHaveProperty('interval.gradingPeriod.current', mockPeriodIndex);
      expect(response.body).toHaveProperty('course');
    });

    test('return classwork for default Marking Period', async () => {
      jest.mock('../../models/period');
      period.getGradingPeriodIndex = () => mockPeriodIndex;

      const response = await request(app).get(`${routePrefix}/${mockStudent.id}/classwork`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('studentId', mockStudent.id);
      expect(response.body).toHaveProperty('studentName', mockStudent.name);
      expect(response.body).toHaveProperty('interval');
      expect(response.body).toHaveProperty('interval.start');
      expect(response.body).toHaveProperty('interval.end');
      expect(response.body).toHaveProperty('course');
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id_failFormat}/classwork?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(400);
    });

    test('return empty array if no record for provided studentId', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id_failFind}/classwork?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('GET /{mockStudent.id}/grades)', () => {
    const expectedGradesResponse = {
      studentId: mockStudent.id,
      studentName: mockStudent.name,
      courseGrades: {},
      gradesAverageUrl: 'http://localhost:3001/api/v1/students/123456/grades/average'
    };

    test('return student grades for default Marking Period', async () => {
      jest.mock('../../models/period');
      period.getGradingPeriodIndex = () => mockPeriodIndex;

      const response = await request(app).get(`${routePrefix}/${mockStudent.id}/grades`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject(expectedGradesResponse);
    });

    test('return student grades for specific Marking Period', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id}/grades?runId=${mockPeriodIndex}`
      );
      // Add the runId to the expected url.
      const expectedClone = { ...expectedGradesResponse };
      expectedClone.gradesAverageUrl += `?runId=${mockPeriodIndex}`;

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject(expectedClone);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id_failFormat}/grades?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(400);
    });

    test('return empty array if no record for provided studentId', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id_failFind}/grades?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(200);
      expect(Object.keys(response.body.courseGrades)).toHaveLength(0);
    });
  });

  describe('GET /{mockStudent.id}/grades/average)', () => {
    test('return average of student course grade averages', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id}/grades/average?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('studentId', mockStudent.id);
      expect(response.body).toHaveProperty('studentName', mockStudent.name);
      expect(response.body).toHaveProperty('alerts');
      expect(response.body.alerts).toHaveLength(1);
      expect(response.body).toHaveProperty('grades');
      expect(response.body.grades).toHaveLength(1);
    });

    test('return average of student course grade averages for default time', async () => {
      const mockInterval = {
        start: 1572847200000,
        end: 1576735200000,
        gradingPeriod: { first: 1, prev: 2, current: 3, next: 4, last: 6 }
      };

      // Mock the timeframe so test won't break in future.
      jest.mock('../../models/period');
      period.getGradingPeriodInterval = () => mockInterval;

      const response = await request(app).get(`${routePrefix}/${mockStudent.id}/grades/average`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('studentId', mockStudent.id);
      expect(response.body).toHaveProperty('studentName', mockStudent.name);
      expect(response.body).toHaveProperty('alerts');
      expect(response.body.alerts).toHaveLength(1);
      expect(response.body).toHaveProperty('grades');
      expect(response.body.grades).toHaveLength(1);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id_failFormat}/grades/average?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(400);
    });

    test('return undefined if no record for provided studentId', async () => {
      const response = await request(app).get(
        `${routePrefix}/${mockStudent.id_failFind}/grades/average?runId=${mockPeriodIndex}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('studentId', mockStudent.id_failFind);
      expect(response.body).not.toHaveProperty('studentName');
    });
  });
});
