const grade = require('../../models/grade');
const rawMockData = require('../mock/classwork.json');

jest.mock('../../data/classwork.json', () => require('../mock/classwork.json'));
jest.mock('../../data/course.json', () => require('../mock/course.json'));

const studentId = 123456;

describe('/models/grades/', () => {
  describe('getStudentClassworkData()', () => {
    test('should return raw classwork', () => {
      expect(grade.getStudentClassworkData(studentId)).toMatchObject(
        rawMockData[studentId].classwork
      );
    });
  });

  describe('getStudentClasswork()', () => {
    test('should return enhanced classwork', () => {
      const studentGrades = grade.getStudentClasswork(studentId);

      // check initial data
      expect(studentGrades[0].score).toBe('95.00');
      // check added data
      expect(studentGrades[0].catWeight).toEqual(0.5);
    });
  });

  describe('getStudentClassworkPeriod()', () => {
    test('should return classwork for specific Marking Period (report card run)', () => {
      expect(grade.getStudentClassworkPeriod(studentId, 3)).toMatchObject(
        rawMockData[studentId].classwork
      );
    });
  });

  describe('getStudentClassworkGrades()', () => {
    test('should return grades for classwork grouped into course and category', () => {
      expect(grade.getStudentClassworkGrades(studentId, 3)).toMatchObject({
        '0123 - 1': { Assessment: [95], Daily: [75] }
      });
    });
  });

  describe('getStudentClassworkGradesWeighted()', () => {
    test('should return weighted grades for classwork grouped into course and category', () => {
      expect(grade.getStudentClassworkGradesWeighted(studentId, 3)).toMatchObject({
        '0123 - 1': { Assessment: [47.5], Daily: [37.5] }
      });
    });
  });

  describe('getStudentClassworkGradesAverage()', () => {
    test('should return grade average for classwork in the Marked Period', () => {
      expect(grade.getStudentClassworkGradesAverage(studentId, 3)).toMatchObject({
        '0123 - 1': '85.00'
      });
    });
  });

  describe('getRunIdForDate()', () => {
    test('should return run identifier for date', () => {
      expect(grade.getRunIdForDate(1579096288679)).toBe(4);
    });
  });

  describe('getRunDateInMs()', () => {
    test('should return run date in milliseconds', () => {
      expect(grade.getRunDateInMs(3)).toMatchObject({ start: 1572847200000, end: 1577080800000 });
    });
  });
});
