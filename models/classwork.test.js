const classwork = require('./classwork');
const mockClassworkRaw = require('../data/mock/classwork.json');

jest.mock('../data/classwork.json', () => require('../data/mock/classwork.json'));
jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const mockStudentId = 123456;
const nonStudentId = 111111;
const badFormatStudentId = 'abc123';
const mockMp = 3;

describe('/models/classwork.js', () => {
  describe('getClassworkRaw()', () => {
    const rawData = classwork.getClassworkRaw(mockStudentId);

    test('return empty array when no mockStudentId', () => {
      expect(classwork.getClassworkRaw()).toMatchObject([]);
    });

    test('return empty array when improperly formatted student ID', () => {
      expect(classwork.getClassworkRaw(badFormatStudentId)).toMatchObject([]);
    });

    test('return empty array when no student record', () => {
      expect(classwork.getClassworkRaw(nonStudentId)).toMatchObject([]);
    });

    test('return raw classwork', () => {
      expect(rawData).toBeTruthy();
    });

    test('return raw classwork matching mock', () => {
      expect(rawData).toMatchObject(mockClassworkRaw[mockStudentId].classwork);
    });
  });

  describe('getClassworkAll()', () => {
    const studentGrades = classwork.getClassworkAll(mockStudentId);

    test('return empty array when no mockStudentId', () => {
      expect(classwork.getClassworkAll()).toHaveLength(0);
    });

    test('return empty array when no student record', () => {
      expect(classwork.getClassworkAll(nonStudentId)).toHaveLength(0);
    });

    test('return empty array when improperly formatted student ID', () => {
      expect(classwork.getClassworkAll(badFormatStudentId)).toHaveLength(0);
    });

    test('return all classwork', () => {
      expect(studentGrades.length).toEqual(5);
    });

    test('return enhanced classwork for GraphQL', () => {
      expect(studentGrades[0]).toMatchObject({
        catWeight: 0.5,
        category: 'Assessment',
        comment: '',
        courseId: '0123 - 1',
        assignment: 'Short Story',
        due: '12/19/2019',
        dueMs: 1576735200000,
        score: 95
      });
    });

    test('return zero score when recorded as M', () => {
      const classworkWithM = studentGrades[4];

      // check score
      expect(classworkWithM.score).toEqual(0);
      // check comment
      expect(classworkWithM.comment).toBe('[missing work]');
    });
  });

  describe('getClassworkForMp()', () => {
    test('return classwork for specific Marking Period', () => {
      const expected = [
        {
          catWeight: 0.5,
          category: 'Assessment',
          comment: '',
          courseId: '0123 - 1',
          assignment: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: 95
        },
        {
          catWeight: 0.5,
          category: 'Daily',
          comment: 'Late Work',
          courseId: '0123 - 1',
          assignment: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: 75
        },
        {
          catWeight: 0.7,
          category: 'Daily',
          comment: '',
          courseId: '4567 - 1',
          assignment: 'Short Story',
          due: '12/18/2019',
          dueMs: 1576648800000,
          score: ''
        }
      ];

      expect(classwork.getClassworkForMp(mockStudentId, mockMp)).toMatchObject(expected);
    });
  });

  describe('getScoredClassworkForMp()', () => {
    test('return scored classwork for specific Marking Period', () => {
      const expected = [
        {
          catWeight: 0.5,
          category: 'Assessment',
          comment: '',
          courseId: '0123 - 1',
          assignment: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: 95
        },
        {
          catWeight: 0.5,
          category: 'Daily',
          comment: 'Late Work',
          courseId: '0123 - 1',
          assignment: 'Short Story',
          due: '12/19/2019',
          dueMs: 1576735200000,
          score: 75
        }
      ];

      expect(classwork.getScoredClassworkForMp(mockStudentId, mockMp)).toMatchObject(expected);
    });
  });

  describe('getClassworkAlerts()', () => {
    test('return classwork comments for specific Marking Period', () => {
      const expected = [
        {
          assignment: 'Short Story',
          comment: 'Late Work',
          course: 'Reading',
          date: '12/19/2019',
          score: 75
        }
      ];

      expect(classwork.getClassworkAlerts(mockStudentId, mockMp)).toMatchObject(expected);
    });
  });
});
