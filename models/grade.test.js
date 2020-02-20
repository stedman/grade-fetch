const grade = require('./grade');
const utilities = require('../lib/utilities');

jest.mock('../data/classwork.json', () => require('../data/mock/classwork.json'));
jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const mockStudentId = 123456;
const nonStudentId = 111111;
const badFormatStudentId = 'abc123';
const mockMp = 3;
const mockSy = 2020;

describe('/models/grades/', () => {
  describe('getGrades()', () => {
    test('return grades for classwork grouped into course and category', () => {
      expect(grade.getGrades(mockStudentId, mockMp, mockSy)).toMatchObject({
        '0123 - 1': { Assessment: [95], Daily: [75] }
      });
    });

    test('return empty record for unrecorded student ID', () => {
      expect(grade.getGrades(nonStudentId)).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      expect(grade.getGrades(badFormatStudentId)).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      expect(grade.getGrades()).toMatchObject({});
    });
  });

  describe('getGradesWeighted()', () => {
    test('return weighted grades for classwork grouped into course and category', () => {
      expect(grade.getGradesWeighted(mockStudentId, mockMp, mockSy)).toMatchObject({
        '0123 - 1': { Assessment: [47.5], Daily: [37.5] }
      });
    });

    test('return empty record for unrecorded student ID', () => {
      expect(grade.getGradesWeighted(nonStudentId)).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      expect(grade.getGradesWeighted(badFormatStudentId)).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      expect(grade.getGradesWeighted()).toMatchObject({});
    });
  });

  describe('getGradesAverage()', () => {
    test('grade average for classwork in the default (current) marking period', () => {
      // Override getMpForDate() to return expected MP for test
      jest.mock('../lib/utilities');
      utilities.getMpForDate = () => mockMp;

      expect(grade.getGradesAverage(mockStudentId)).toMatchObject({
        '0123 - 1': '85.00'
      });
    });

    test('return grade average for classwork in the Marking Period', () => {
      expect(grade.getGradesAverage(mockStudentId, mockMp, mockSy)).toMatchObject({
        '0123 - 1': '85.00'
      });
    });

    test('return empty record for unrecorded student ID', () => {
      expect(grade.getGradesAverage(nonStudentId)).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      expect(grade.getGradesAverage(badFormatStudentId)).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      expect(grade.getGradesAverage()).toMatchObject({});
    });
  });

  describe('getGradesAverageGql()', () => {
    test('return grade average for classwork in the Marking Period', () => {
      expect(grade.getGradesAverageGql(mockStudentId, mockMp, mockSy)).toMatchObject([
        {
          average: 85,
          courseId: '0123 - 1'
        }
      ]);
    });

    test('return empty record for unrecorded student ID', () => {
      expect(grade.getGradesAverageGql(nonStudentId)).toMatchObject({});
    });

    test('return empty record for bad format student ID', () => {
      expect(grade.getGradesAverageGql(badFormatStudentId)).toMatchObject({});
    });

    test('return empty record for no student ID', () => {
      expect(grade.getGradesAverageGql()).toMatchObject({});
    });
  });
});
