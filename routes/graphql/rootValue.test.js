const request = require('supertest');
const app = require('../../app');

jest.mock('../../data/student.json', () => require('../../data/mock/student.json'));
jest.mock('../../data/grades.json', () => require('../../data/mock/grades.json'));

const mockStudent = {
  id: 123456,
  name: 'Amber Lith',
  id_failFormat: 'abc123',
  id_failFind: 111111
};
const mockPeriodIndex = 3;

const routePrefix = '/graphql';

describe('/routes/graphql/rootValue.js', () => {
  describe('POST graphql query: students', () => {
    test('return all student data', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            students {
              id,
              name
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        data: {
          students: [
            {
              id: 123456,
              name: 'Amber Lith'
            },
            {
              id: 234567,
              name: 'Ruby Lith'
            }
          ]
        }
      });
    });

    test('return 400 error for incorrect field name', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            students {
              badFieldName
            }
          }`
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST graphql query: student', () => {
    test('return student data', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            student(id: ${mockStudent.id}) {
              id,
              name
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        data: {
          student: {
            id: mockStudent.id,
            name: mockStudent.name
          }
        }
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            student(id: ${mockStudent.id_failFormat}) {
              id
            }
          }`
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('return empty object if no record for provided studentId', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            student(id: ${mockStudent.id_failFind}) {
              id,
              name
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({});
    });
  });

  describe('POST graphql query: classwork', () => {
    test('return student classwork data', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            classwork(studentId: ${mockStudent.id}, runId: ${mockPeriodIndex}) {
              courseId
              courseName
              assignments {
                dateDue
                dateDueMs
                dateAssigned
                assignment
                category
                score
                weightedScore
                weightedTotalPoints
                comment
              }
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('data.classwork');
      expect(response.body.data.classwork[0].assignments[0]).toMatchObject({
        dateDue: '12/19/2019',
        dateDueMs: 1576735200000,
        dateAssigned: '',
        assignment: 'Short Story',
        category: 'Assessment',
        score: 95,
        weightedScore: '95.00',
        weightedTotalPoints: 100,
        comment: ''
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            classwork(studentId: ${mockStudent.id_failFormat}) {
              courseId
            }
          }`
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('return empty object if no record for provided studentId', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            classwork(studentId: ${mockStudent.id_failFind}, runId: ${mockPeriodIndex}) {
              courseId
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({});
    });
  });

  describe('POST graphql query: gradeAverage', () => {
    test('return student grade average data', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            gradeAverage(studentId: ${mockStudent.id}, runId: ${mockPeriodIndex}) {
              courseId,
              courseName,
              average
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('data.gradeAverage');
      expect(response.body.data.gradeAverage[0]).toMatchObject({
        courseId: '0123 - 1',
        courseName: 'Reading',
        average: 85
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            gradeAverage(studentId: ${mockStudent.id_failFormat}) {
              average
            }
          }`
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('return empty object if no record for provided studentId', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            gradeAverage(studentId: ${mockStudent.id_failFind}, runId: ${mockPeriodIndex}) {
              average
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({});
    });
  });
});
