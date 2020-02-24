const grade = require('./grade');
const period = require('../models/period');

jest.mock('../data/classwork.json', () => require('../data/mock/classwork.json'));
jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const mockStudentId = 123456;
const nonStudentId = 111111;
const badFormatStudentId = 'abc123';
const mockPeriodKey = 'sixWeek';
const mockPeriodIndex = 3;

describe('/models/grades/', () => {
  describe('getGrades()', () => {
    test('return grades for classwork grouped into course and category', () => {
      const result = grade.getGrades(mockStudentId, mockPeriodIndex, mockPeriodKey);
      expect(result).toMatchObject({
        '0123 - 1': { Assessment: [95], Daily: [75] }
      });
    });

    test('return empty record for unrecorded student ID', () => {
      const result = grade.getGrades(nonStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      const result = grade.getGrades(badFormatStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      const result = grade.getGrades();
      expect(result).toMatchObject({});
    });
  });

  describe('getGradesWeighted()', () => {
    test('return weighted grades for classwork grouped into course and category', () => {
      const result = grade.getGradesWeighted(mockStudentId, mockPeriodIndex, mockPeriodKey);
      expect(result).toMatchObject({
        '0123 - 1': { Assessment: [47.5], Daily: [37.5] }
      });
    });

    test('return empty record for unrecorded student ID', () => {
      const result = grade.getGradesWeighted(nonStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      const result = grade.getGradesWeighted(badFormatStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      const result = grade.getGradesWeighted();
      expect(result).toMatchObject({});
    });
  });

  describe('getGradesAverage()', () => {
    test('grade average for classwork in the default (current) marking period', () => {
      // Override upstream method to return expected periodIndex for test
      jest.mock('../models/period');
      period.getGradingPeriodIndex = () => mockPeriodIndex;

      const result = grade.getGradesAverage(mockStudentId);

      expect(result).toMatchObject({
        '0123 - 1': '85.00'
      });
    });

    test('return grade average for classwork in the Marking Period', () => {
      const result = grade.getGradesAverage(mockStudentId, mockPeriodIndex, mockPeriodKey);
      expect(result).toMatchObject({
        '0123 - 1': '85.00'
      });
    });

    test('return empty record for unrecorded student ID', () => {
      const result = grade.getGradesAverage(nonStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      const result = grade.getGradesAverage(badFormatStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      const result = grade.getGradesAverage();
      expect(result).toMatchObject({});
    });
  });

  describe('getGradesAverageGql()', () => {
    test('return grade average for classwork in the Marking Period', () => {
      expect(
        grade.getGradesAverageGql(mockStudentId, mockPeriodIndex, mockPeriodKey)
      ).toMatchObject([
        {
          average: 85,
          courseId: '0123 - 1'
        }
      ]);
    });

    test('return empty record for unrecorded student ID', () => {
      expect(grade.getGradesAverageGql(nonStudentId)).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      expect(grade.getGradesAverageGql(badFormatStudentId)).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      expect(grade.getGradesAverageGql()).toMatchObject({});
    });
  });
});
