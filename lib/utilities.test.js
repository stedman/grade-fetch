const utilities = require('./utilities');
const mockPeriodData = require('../data/mock/gradingPeriods.json');

describe('/lib/utilities.js', () => {
  describe('getSchoolYear()', () => {
    const expectedYear = new Date().getFullYear().toString();
    const schoolYear = utilities.getSchoolYear();

    test('returns current school year', () => {
      expect(schoolYear).toEqual(expectedYear);
    });
  });

  describe('getSchoolYear(date)', () => {
    const testDate = '2000/01/01';

    test('returns school year for provided date string', () => {
      const schoolYear = utilities.getSchoolYear(testDate);

      expect(schoolYear).toEqual('2000');
    });

    test('returns school year for provided Date object', () => {
      const schoolYear = utilities.getSchoolYear(new Date(testDate));

      expect(schoolYear).toEqual('2000');
    });

    test('returns current school year if arg is not legit date', () => {
      const expectedYear = new Date().getFullYear().toString();
      const schoolYear = utilities.getSchoolYear('invalid');

      expect(schoolYear).toEqual(expectedYear);
    });
  });

  describe('getGradingPeriodsFromGradeLevel()', () => {
    const grades = [
      { level: 5, key: 'nineWeek' },
      { level: 6, key: 'sixWeek' }
    ];

    test('return Grading Period for specified grade level', () => {
      grades.forEach((grade) => {
        const result = utilities.getGradingPeriodsFromGradeLevel(grade.level);

        expect(result).toMatchObject(mockPeriodData[grade.key]);
      });
    });
  });

  describe('getGradingPeriodIndex()', () => {
    const dateMs = 1579096288679;
    const periodKey = 'sixWeek';
    const result = utilities.getGradingPeriodIndex(dateMs, periodKey);

    test('return run identifier for date', () => {
      expect(result).toEqual(4);
    });
  });

  describe('getGradingPeriodTime()', () => {
    test('return Grading Period date in milliseconds', () => {
      const periodIndex = 3;
      const periodKey = 'sixWeek';
      const result = utilities.getGradingPeriodTime(periodIndex, periodKey);
      const expectedInterval = {
        start: 1572847200000,
        end: 1576735200000,
        gradingPeriod: { first: 1, prev: 2, current: 3, next: 4, last: 6 }
      };

      expect(result).toMatchObject(expectedInterval);
    });
  });
});
