const student = require('../../models/student');
const rawMockData = require('../mock/student.json');

jest.mock('../../data/student.json', () => require('../mock/student.json'));

const studentId = '123456';

describe('/models/students', () => {
  describe('getAllStudentRecords()', () => {
    test('should return all student records', () => {
      expect(student.getAllStudentRecords()).toEqual(rawMockData);
    });
  });

  describe('getStudentRecord()', () => {
    test('should one student record', () => {
      expect(student.getStudentRecord(studentId)).toMatchObject(rawMockData[studentId]);
    });
  });
});
