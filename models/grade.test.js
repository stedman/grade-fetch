const grade = require('./grade');
const rawMockData = require('../data/mock/classwork.json');

jest.mock('../data/classwork.json', () => require('../data/mock/classwork.json'));
jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const studentId = 123456;
const runId = 3;

describe('/models/grades/', () => {
  describe('getStudentClassworkData()', () => {
    test('return raw classwork', () => {
      expect(grade.getStudentClassworkData(studentId)).toMatchObject(
        rawMockData[studentId].classwork
      );
    });

    test('return empty object when no studentId', () => {
      expect(grade.getStudentClassworkData()).toMatchObject({});
    });
  });

  describe('getStudentClasswork()', () => {
    const studentGrades = grade.getStudentClasswork(studentId);

    test('return all classwork', () => {
      // check score
      expect(studentGrades[3].score).toEqual(0);
      // check comment
      expect(studentGrades[3].comment).toBe('[missing work]');
    });

    test('return enhanced classwork', () => {
      // check initial data
      expect(studentGrades[0].score).toBe('95.00');
      // check added data
      expect(studentGrades[0].catWeight).toEqual(0.5);
      // check entire return data
      expect(studentGrades[0]).toMatchObject({
        assignment: 'Short Story',
        catWeight: 0.5,
        category: 'Assessment',
        comment: '',
        course: '0123 - 1 Reading',
        courseId: '0123 - 1',
        dateAssign: '12/09/2019',
        dateDue: '12/19/2019',
        dateDueMs: 1576735200000,
        score: '95.00'
      });
    });

    test('return zero score when recorded as M', () => {
      expect(studentGrades[3].score).toEqual(0);
    });
  });

  describe('getStudentClassworkGql()', () => {
    const studentGrades = grade.getStudentClassworkGql(studentId);

    test('return all classwork', () => {
      expect(studentGrades.length).toEqual(4);
    });

    test('return enhanced classwork for GraphQL', () => {
      expect(studentGrades[0]).toMatchObject({
        catWeight: 0.5,
        category: 'Assessment',
        comment: '',
        courseId: '0123 - 1',
        description: 'Short Story',
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

  describe('getStudentClassworkPeriod()', () => {
    // Grab a subset of the mock data that would fit into the test Marking Period.
    const classwork = rawMockData[studentId].classwork.filter((task) => {
      return task.dateDue === '12/19/2019';
    });

    test('return classwork for specific Marking Period (report card run)', () => {
      expect(grade.getStudentClassworkPeriod(studentId, runId)).toMatchObject(classwork);
    });
  });

  describe('getStudentClassworkPeriodGql()', () => {
    test('return classwork for specific Marking Period (report card run)', () => {
      const expected = [
        {
          catWeight: 0.5,
          category: 'Assessment',
          comment: '',
          courseId: '0123 - 1',
          description: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: '95.00'
        },
        {
          catWeight: 0.5,
          category: 'Daily',
          comment: 'Late Work',
          courseId: '0123 - 1',
          description: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: '75.00'
        }
      ];

      expect(grade.getStudentClassworkPeriodGql(studentId, runId)).toMatchObject(expected);
    });
  });

  describe('getStudentClassworkGrades()', () => {
    test('return grades for classwork grouped into course and category', () => {
      expect(grade.getStudentClassworkGrades(studentId, runId)).toMatchObject({
        '0123 - 1': { Assessment: [95], Daily: [75] }
      });
    });
  });

  describe('getStudentClassworkGradesWeighted()', () => {
    test('return weighted grades for classwork grouped into course and category', () => {
      expect(grade.getStudentClassworkGradesWeighted(studentId, runId)).toMatchObject({
        '0123 - 1': { Assessment: [47.5], Daily: [37.5] }
      });
    });
  });

  describe('getStudentClassworkGradesAverage()', () => {
    test('return grade average for classwork in the Marked Period', () => {
      expect(grade.getStudentClassworkGradesAverage(studentId, runId)).toMatchObject({
        '0123 - 1': '85.00'
      });
    });
  });

  describe('getStudentClassworkGradesAverageGql()', () => {
    test('return grade average for classwork in the Marked Period', () => {
      expect(grade.getStudentClassworkGradesAverageGql(studentId, runId)).toMatchObject([
        {
          average: '85.00',
          courseId: '0123 - 1'
        }
      ]);
    });
  });

  describe('getRunIdForDate()', () => {
    test('return run identifier for date', () => {
      expect(grade.getRunIdForDate(1579096288679)).toBe(4);
    });
  });

  describe('getRunDateInMs()', () => {
    test('return run date in milliseconds', () => {
      expect(grade.getRunDateInMs(3)).toMatchObject({ start: 1572847200000, end: 1577080800000 });
    });
  });
});
