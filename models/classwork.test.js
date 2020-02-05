const utilities = require('../lib/utilities');
const classwork = require('./classwork');
const mockClassworkRaw = require('../data/mock/classwork.json');

jest.mock('../data/classwork.json', () => require('../data/mock/classwork.json'));
jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const studentId = '123456';
const schoolYear = utilities.getSchoolYear('2020');
const runId = '3';

describe('/models/classwork.js', () => {
  describe('getClassworkRaw()', () => {
    const rawData = classwork.getClassworkRaw(studentId);

    test('return raw classwork', () => {
      expect(rawData).toBeTruthy();
    });

    test('return raw classwork matching mock', () => {
      expect(rawData).toMatchObject(mockClassworkRaw[studentId][schoolYear].classwork);
    });

    test('return empty object when no studentId', () => {
      expect(classwork.getClassworkRaw()).toMatchObject({});
    });
  });

  describe('getClassworkAll()', () => {
    const studentGrades = classwork.getClassworkAll(studentId);

    test('return all classwork', () => {
      expect(studentGrades.length).toEqual(4);
    });

    test('return enhanced classwork for GraphQL', () => {
      expect(studentGrades[0]).toMatchObject({
        catWeight: 0.5,
        category: 'Assessment',
        comment: '',
        courseId: '0123 - 1',
        assignment: 'Short Story',
        due: '12/19/2019',
        dueMs: 1576735200000,
        score: '95.00'
      });
    });

    test('return zero score when recorded as M', () => {
      // check score
      expect(studentGrades[3].score).toEqual(0);
      // check comment
      expect(studentGrades[3].comment).toBe('[missing work]');
    });
  });

  describe('getClassworkForRun()', () => {
    test('return classwork for specific Marking Period (report card run)', () => {
      const expected = [
        {
          catWeight: 0.5,
          category: 'Assessment',
          comment: '',
          courseId: '0123 - 1',
          assignment: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: '95.00'
        },
        {
          catWeight: 0.5,
          category: 'Daily',
          comment: 'Late Work',
          courseId: '0123 - 1',
          assignment: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: '75.00'
        }
      ];

      expect(classwork.getClassworkForRun(studentId, runId)).toMatchObject(expected);
    });
  });
});
