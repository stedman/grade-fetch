const Grades = require('../../models/grades');
const rawMockData = require('../mock/grades.json');

jest.mock('../../data/grades.json', () => require('../mock/grades.json'));
jest.mock('../../data/course.json', () => require('../mock/course.json'));

const studentId = 123456;
const grades = new Grades(studentId);

describe('/models/grades/', () => {
  test('getAllStudentClasswork() should return correct student classwork', () => {
    expect(grades.getAllStudentClasswork())
      .toMatchObject(rawMockData[studentId].classwork);
  });

  test('getAllStudentClassworkEnhanced() should return enhanced classwork data', () => {
    const studentGrades = grades.getAllStudentClassworkEnhanced();

    // check initial data
    expect(studentGrades[0].score)
      .toBe('95.00');
    // check added data
    expect(studentGrades[0].catWeight)
      .toEqual(0.5);
  });

  test('getGradeSnapshot()', () => {
    expect(grades.getGradeSnapshot(3))
      .toMatchObject({ '0123 - 1': '85.00' });
  });

  test('getRunIdForDate()', () => {
    expect(Grades.getRunIdForDate(1579096288679))
      .toBe(4);
  });

  test('getRunDateInMs()', () => {
    expect(Grades.getRunDateInMs(3))
      .toMatchObject({ start: 1572847200000, end: 1577080800000 });
  });
});
