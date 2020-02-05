const utilities = require('../lib/utilities');
const grade = require('./grade');

jest.mock('../data/classwork.json', () => require('../data/mock/classwork.json'));
jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const studentId = '123456';
const runId = '3';

describe('/models/grades/', () => {
  describe('getGrades()', () => {
    test('return grades for classwork grouped into course and category', () => {
      expect(grade.getGrades(studentId, runId)).toMatchObject({
        '0123 - 1': { Assessment: [95], Daily: [75] }
      });
    });
  });

  describe('getGradesWeighted()', () => {
    test('return weighted grades for classwork grouped into course and category', () => {
      expect(grade.getGradesWeighted(studentId, runId)).toMatchObject({
        '0123 - 1': { Assessment: [47.5], Daily: [37.5] }
      });
    });
  });

  describe('getGradesAverage()', () => {
    test('return grade average for classwork in the Marked Period', () => {
      expect(grade.getGradesAverage(studentId, runId)).toMatchObject({
        '0123 - 1': '85.00'
      });
    });
  });

  describe('getGradesAverageGql()', () => {
    test('return grade average for classwork in the Marked Period', () => {
      expect(grade.getGradesAverageGql(studentId, runId)).toMatchObject([
        {
          average: '85.00',
          courseId: '0123 - 1'
        }
      ]);
    });
  });
});
