const Grades = require('../../models/grades');
const rawMockData = require('../mock/classwork.json');

jest.mock('../../data/classwork.json', () => require('../mock/classwork.json'));
jest.mock('../../data/course.json', () => require('../mock/course.json'));

const studentId = 123456;
const grades = new Grades(studentId);

describe('/models/grades/', () => {
  test('getStudentClassworkDataData() should return correct student classwork', () => {
    expect(grades.getStudentClassworkData()).toMatchObject(rawMockData[studentId].classwork);
  });

  test('getStudentClasswork() should return enhanced classwork data', () => {
    const studentGrades = grades.getStudentClasswork();

    // check initial data
    expect(studentGrades[0].score).toBe('95.00');
    // check added data
    expect(studentGrades[0].catWeight).toEqual(0.5);
  });

  test('getStudentClassworkPeriod()', () => {
    expect(grades.getStudentClassworkPeriod(3)).toMatchObject(rawMockData[studentId].classwork);
  });

  test('getStudentClassworkGrades()', () => {
    expect(grades.getStudentClassworkGrades(3)).toMatchObject({
      '0123 - 1': { Assessment: [95], Daily: [75] }
    });
  });

  test('getStudentClassworkGradesWeighted()', () => {
    expect(grades.getStudentClassworkGradesWeighted(3)).toMatchObject({
      '0123 - 1': { Assessment: [47.5], Daily: [37.5] }
    });
  });

  test('getStudentClassworkGradesAverage()', () => {
    expect(grades.getStudentClassworkGradesAverage(3)).toMatchObject({ '0123 - 1': '85.00' });
  });

  test('getRunIdForDate()', () => {
    expect(Grades.getRunIdForDate(1579096288679)).toBe(4);
  });

  test('getRunDateInMs()', () => {
    expect(Grades.getRunDateInMs(3)).toMatchObject({ start: 1572847200000, end: 1577080800000 });
  });
});
