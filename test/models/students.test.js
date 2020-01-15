const Students = require('../../models/students');
const rawMockData = require('../mock/student.json');

jest.mock('../../data/student.json', () => require('../mock/student.json'));

const studentId = '123456';
const student = new Students(studentId);

describe('/models/students', () => {
  test('getAllStudentRecords() should return all student records', () => {
    expect(Students.getAllStudentRecords())
      .toEqual(rawMockData);
  });

  test('getStudentRecord() should one student record', () => {
    expect(student.getStudentRecord())
      .toMatchObject(rawMockData[studentId]);
  });
});
