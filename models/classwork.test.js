const classwork = require('./classwork');
const mockGradesRaw = require('../data/mock/grades.json');

jest.mock('../data/grades.json', () => require('../data/mock/grades.json'));

const mockStudentId = 123456;
const nonStudentId = 111111;
const badFormatStudentId = 'abc123';
const mockPeriodIndex = 3;
const mockPeriodKey = 'sixWeek';

describe('/models/classwork.js', () => {
  describe('getAllRecordsRaw()', () => {
    const studentRecord = classwork.getAllRecordsRaw(mockStudentId);
    const emptyResult = {};

    test('return empty array when no mockStudentId', () => {
      const result = classwork.getAllRecordsRaw();

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when improperly formatted student ID', () => {
      const result = classwork.getAllRecordsRaw(badFormatStudentId);

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when no student record', () => {
      const result = classwork.getAllRecordsRaw(nonStudentId);

      expect(result).toMatchObject(emptyResult);
    });

    test('return raw classwork', () => {
      expect(studentRecord).toBeTruthy();
    });

    test('return raw classwork matching mock', () => {
      const expected = mockGradesRaw[mockStudentId].course;

      expect(studentRecord).toMatchObject(expected);
    });
  });

  describe('getAllRecords()', () => {
    const studentRecord = classwork.getAllRecords(mockStudentId);
    const emptyResult = {};

    test('return empty array when no mockStudentId', () => {
      const result = classwork.getAllRecords();

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when no student record', () => {
      const result = classwork.getAllRecords(nonStudentId);

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when improperly formatted student ID', () => {
      const result = classwork.getAllRecords(badFormatStudentId);

      expect(result).toMatchObject(emptyResult);
    });

    test('return all classwork', () => {
      expect(studentRecord).toHaveProperty('0123 - 1');
      expect(studentRecord).toHaveProperty('0123 - 1.name');
      expect(studentRecord).toHaveProperty('0123 - 1.categoryTotal');
      expect(studentRecord).toHaveProperty('0123 - 1.category');
      expect(studentRecord).toHaveProperty('0123 - 1.classwork');
      expect(studentRecord['0123 - 1'].classwork).toHaveLength(3);
    });
  });

  describe('getGradingPeriodRecords()', () => {
    test('return classwork for specific Grading Period', () => {
      const studentRecord = classwork.getGradingPeriodRecords(
        mockStudentId,
        mockPeriodIndex,
        mockPeriodKey
      );

      expect(studentRecord).toHaveProperty('0123 - 1');
      expect(studentRecord).toHaveProperty('0123 - 1.name');
      expect(studentRecord).toHaveProperty('0123 - 1.categoryTotal');
      expect(studentRecord).toHaveProperty('0123 - 1.category');
      expect(studentRecord).toHaveProperty('0123 - 1.classwork');
      expect(studentRecord['0123 - 1'].classwork).toHaveLength(2);
    });
  });

  describe('getClassworkAlerts()', () => {
    test('return classwork comments for specific Grading Period', () => {
      const result = classwork.getClassworkAlerts(mockStudentId, mockPeriodIndex, mockPeriodKey);
      const expected = [
        {
          assignment: 'Short Story',
          comment: 'Late Work',
          course: 'Reading',
          date: '12/19/2019',
          score: '75.00'
        }
      ];

      expect(result).toMatchObject(expected);
    });
  });
});
