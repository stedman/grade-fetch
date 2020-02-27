const grade = require('./grade');
const period = require('../models/period');

jest.mock('../data/grades.json', () => require('../data/mock/grades.json'));

const mockStudentId = 123456;
const nonStudentId = 111111;
const badFormatStudentId = 'abc123';
const mockPeriodKey = 'sixWeek';
const mockPeriodIndex = 3;

describe('/models/grades/', () => {
  describe('getGrades()', () => {
    test('return grades for classwork grouped into course and category', () => {
      const result = grade.getGrades(mockStudentId, mockPeriodIndex, mockPeriodKey);

      expect(result).toHaveProperty('0123 - 1');
      expect(result).toHaveProperty('0123 - 1.categoryWeight');
      expect(result).toHaveProperty('0123 - 1.weightedScore');
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

  describe('getGradeAverage()', () => {
    test('grade average for classwork in the default (current) marking period', () => {
      // Override upstream method to return expected periodIndex for test
      jest.mock('../models/period');
      period.getGradingPeriodIndex = () => mockPeriodIndex;

      const result = grade.getGradeAverage(mockStudentId);

      expect(result).toHaveProperty('0123 - 1');
      expect(result).toHaveProperty('0123 - 1.courseName');
      expect(result).toHaveProperty('0123 - 1.categoryWeight');
      expect(result).toHaveProperty('0123 - 1.categoryWeight.Daily', 1);
      expect(result).toHaveProperty('0123 - 1.weightedScore');
      expect(result).toHaveProperty('0123 - 1.weightedTotalPoints');
    });

    test('return grade average for classwork in the Marking Period', () => {
      const result = grade.getGradeAverage(mockStudentId, mockPeriodIndex, mockPeriodKey);

      expect(result).toHaveProperty('0123 - 1');
      expect(result).toHaveProperty('0123 - 1.courseName');
      expect(result).toHaveProperty('0123 - 1.categoryWeight');
      expect(result).toHaveProperty('0123 - 1.categoryWeight.Daily', 1);
      expect(result).toHaveProperty('0123 - 1.weightedScore');
      expect(result).toHaveProperty('0123 - 1.weightedTotalPoints');
    });

    test('return empty record for unrecorded student ID', () => {
      const result = grade.getGradeAverage(nonStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      const result = grade.getGradeAverage(badFormatStudentId);
      expect(result).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      const result = grade.getGradeAverage();
      expect(result).toMatchObject({});
    });
  });
});
