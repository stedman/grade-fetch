const period = require('./period');

jest.mock('../config/gradingPeriods.json', () => require('../data/mock/gradingPeriods.json'));

const mockPeriodKey = 'sixWeek';
const mockPeriodIndex = 3;
const mockGradingPeriod = {
  key: mockPeriodKey,
  id: mockPeriodIndex
};

describe('/models/period.js', () => {
  describe('getSchoolYear()', () => {
    const expectedYear = new Date().getFullYear().toString();
    const mockDate = '2000/01/01';

    test('returns current school year', () => {
      const schoolYear = period.getSchoolYear();

      expect(schoolYear).toEqual(expectedYear);
    });

    test('returns school year for provided date string', () => {
      const schoolYear = period.getSchoolYear(mockDate);

      expect(schoolYear).toEqual('2000');
    });

    test('returns school year for provided Date object', () => {
      const schoolYear = period.getSchoolYear(new Date(mockDate));

      expect(schoolYear).toEqual('2000');
    });

    test('returns current school year if arg is not legit date', () => {
      const expectedYear = new Date().getFullYear().toString();
      const schoolYear = period.getSchoolYear('invalid');

      expect(schoolYear).toEqual(expectedYear);
    });
  });

  describe('getGradingPeriodsFromPeriodKey()', () => {
    test('return Grading Period for specified grade level', () => {
      const result = period.getGradingPeriodsFromPeriodKey(mockPeriodKey);

      expect(result).toHaveLength(6);
    });
  });

  describe('getGradingPeriodIndex()', () => {
    test('return run identifier for provided date', () => {
      const result1 = period.getGradingPeriodIndex({ key: mockPeriodKey, date: '12/10/2019' });
      // Try again using dashes instead of slashes
      const result2 = period.getGradingPeriodIndex({ key: mockPeriodKey, date: '12-10-2019' });

      expect(result1).toEqual(mockPeriodIndex);
      expect(result2).toEqual(mockPeriodIndex);
    });

    test('return current run identifier if incorrect date format provided', () => {
      const result = period.getGradingPeriodIndex({ key: mockPeriodKey, date: '1999/12/31' });

      expect(result).not.toEqual(mockPeriodIndex);
    });

    test('return zero run identifier if entire year requested', () => {
      const result = period.getGradingPeriodIndex({ key: mockPeriodKey, isAll: true });

      expect(result).toEqual(0);
    });
  });

  describe('getGradingPeriodInterval()', () => {
    test('return Grading Period date in milliseconds', () => {
      const result = period.getGradingPeriodInterval(mockGradingPeriod);
      const expectedInterval = {
        start: 1572847200000,
        end: 1576735200000,
        gradingPeriod: { first: 1, prev: 2, current: 3, next: 4, last: 6 }
      };

      expect(result).toMatchObject(expectedInterval);
    });
  });
});
