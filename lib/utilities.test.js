const utilities = require('./utilities');

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

  describe('getMpForDate()', () => {
    test('return run identifier for date', () => {
      expect(utilities.getMpForDate(1579096288679)).toMatchObject({
        schoolYear: 2020,
        markingPeriod: 4
      });
    });
  });

  describe('getMpIntervals()', () => {
    test('return MP date in milliseconds', () => {
      expect(utilities.getMpIntervals(3)).toMatchObject({
        start: 1572847200000,
        end: 1576735200000
      });
    });
  });
});
