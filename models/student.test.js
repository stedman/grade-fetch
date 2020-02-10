const student = require('./student');
const rawMockData = require('../data/mock/student.json');

jest.mock('../data/student.json', () => require('../data/mock/student.json'));

const mockStudentId = 123456;

describe('/models/students', () => {
  describe('getAllStudentRecords()', () => {
    test('return all student records', () => {
      expect(student.getAllStudentRecords()).toEqual(rawMockData);
    });
  });

  describe('getStudentRecord()', () => {
    test('return one student record', () => {
      expect(student.getStudentRecord(mockStudentId)).toMatchObject(rawMockData[mockStudentId]);
    });

    test('return no student record if no student record', () => {
      expect(student.getStudentRecord(111111)).toMatchObject({});
    });

    test('return no student record if no student ID', () => {
      expect(student.getStudentRecord()).toMatchObject({});
    });
  });
});
