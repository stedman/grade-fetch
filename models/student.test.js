const student = require('./student');
const rawMockData = require('../data/mock/student.json');

jest.mock('../data/student.json', () => require('../data/mock/student.json'));
jest.mock('../config/gradingPeriods.json', () => require('../data/mock/gradingPeriods.json'));

const mockStudentId = 123456;
const mockStudentRecord = {
  name: 'Amber Lith',
  fullname: 'Lith, Amber',
  grade: '07',
  building: 'Big Middle School',
  homeroom: {
    room: '2135',
    teacher: 'Tickulate, Jess'
  },
  courses: ['787 - 1', '776 - 2', '797 - 3', '731 - 4', '827 - 7', '828 - 7', '720 - 8', '750 - 9'],
  gradingPeriodKey: 'sixWeek'
};

describe('/models/students', () => {
  describe('getAllStudentRecords()', () => {
    test('return all student records', () => {
      expect(student.getAllStudentRecords()).toEqual(rawMockData);
    });
  });

  describe('getStudentRecord()', () => {
    test('return one student record', () => {
      expect(student.getStudentRecord(mockStudentId)).toMatchObject(mockStudentRecord);
    });

    test('return no student record if no student record', () => {
      expect(student.getStudentRecord(111111)).toMatchObject({});
    });

    test('return no student record if no student ID', () => {
      expect(student.getStudentRecord()).toMatchObject({});
    });
  });
});
