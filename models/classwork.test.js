const classwork = require('./classwork');
const mockGradesRaw = require('../data/mock/grades.json');

jest.mock('../data/grades.json', () => require('../data/mock/grades.json'));

const mockStudent = {
  id: 123456,
  name: 'Amber Lith',
  id_failFormat: 'abc123',
  id_failFind: 111111
};
const mockPeriodIndex = 3;
const mockPeriodKey = 'sixWeek';

describe('/models/classwork.js', () => {
  describe('getAllRecordsRaw()', () => {
    const studentRecord = classwork.getAllRecordsRaw(mockStudent.id);
    const emptyResult = {};

    test('return empty array when no mockStudent.id', () => {
      const result = classwork.getAllRecordsRaw();

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when improperly formatted student ID', () => {
      const result = classwork.getAllRecordsRaw(mockStudent.id_failFormat);

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when no student record', () => {
      const result = classwork.getAllRecordsRaw(mockStudent.id_failFind);

      expect(result).toMatchObject(emptyResult);
    });

    test('return raw classwork', () => {
      expect(studentRecord).toBeTruthy();
    });

    test('return raw classwork matching mock', () => {
      const expected = mockGradesRaw[mockStudent.id].course;

      expect(studentRecord).toMatchObject(expected);
    });
  });

  describe('getAllRecords()', () => {
    const studentRecord = classwork.getAllRecords(mockStudent.id);
    const emptyResult = {};

    test('return empty array when no mockStudent.id', () => {
      const result = classwork.getAllRecords();

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when no student record', () => {
      const result = classwork.getAllRecords(mockStudent.id_failFind);

      expect(result).toMatchObject(emptyResult);
    });

    test('return empty array when improperly formatted student ID', () => {
      const result = classwork.getAllRecords(mockStudent.id_failFormat);

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
      const mockGradingPeriod = {
        key: mockPeriodKey,
        id: mockPeriodIndex
      };
      const studentRecord = classwork.getGradingPeriodRecords(mockStudent.id, mockGradingPeriod);

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
      const mockGradingPeriod = {
        key: mockPeriodKey,
        id: mockPeriodIndex
      };
      const result = classwork.getClassworkAlerts(mockStudent.id, mockGradingPeriod);
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
