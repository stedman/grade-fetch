const request = require('supertest');
const app = require('../../app');

jest.mock('../../data/classwork.json', () => require('../../data/mock/classwork.json'));
jest.mock('../../data/course.json', () => require('../../data/mock/course.json'));
jest.mock('../../data/student.json', () => require('../../data/mock/student.json'));

const routePrefix = '/graphql';
const mockStudentId = 123456;
const badFormatStudentId = 'abc123';
const nonStudentId = 111111;
const mockMp = 3;
const courseGradesData = require('../../data/mock/courseGrades.json');
const courseGradesAverageData = require('../../data/mock/courseGradesAverage.json');

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
            student(id: ${mockStudentId}) {
              id,
              name
            }
          }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({
        data: {
          student: {
            id: 123456,
            name: 'Amber Lith'
          }
        }
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            student(id: ${badFormatStudentId}) {
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
            student(id: ${nonStudentId}) {
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
          classwork(studentId: ${mockStudentId}, mp: ${mockMp}) {
            due,
            dueMs,
            assigned,
            courseId,
            courseName,
            assignment,
            category,
            score,
            catWeight,
            comment
          }
        }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('data.classwork');
      expect(response.body.data.classwork[0]).toMatchObject({
        due: '12/19/2019',
        dueMs: 1576735200000,
        assigned: '',
        courseId: '0123 - 1',
        courseName: 'Reading',
        assignment: 'Short Story',
        category: 'Assessment',
        score: 95,
        catWeight: 0.5,
        comment: ''
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const response = await request(app)
        .post(`${routePrefix}`)
        .send({
          query: `{
            classwork(studentId: ${badFormatStudentId}) {
              assignment
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
          classwork(studentId: ${nonStudentId}, mp: ${mockMp}) {
            assignment
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
          gradeAverage(studentId: ${mockStudentId}, mp: ${mockMp}) {
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
            gradeAverage(studentId: ${badFormatStudentId}) {
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
          gradeAverage(studentId: ${nonStudentId}, mp: ${mockMp}) {
            average
          }
        }`
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toMatchObject({});
    });
  });
});
