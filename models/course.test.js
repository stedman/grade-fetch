const courses = require('./course');
const rawMockData = require('../data/mock/course.json');

jest.mock('../data/course.json', () => require('../data/mock/course.json'));

const mockCourseId = '0123 - 1';

describe('/models/courses', () => {
  describe('getCourse()', () => {
    test('should return course data', () => {
      expect(courses.getCourse(mockCourseId)).toMatchObject(rawMockData[mockCourseId]);
    });
  });

  describe('getCategoryWeight()', () => {
    test('should return proper weight', () => {
      const cat = 'Daily';
      const catWeight = courses.getCategoryWeight(mockCourseId, cat);

      expect(catWeight).toEqual(rawMockData[mockCourseId].category[cat]);
      expect(catWeight).toBeGreaterThanOrEqual(0);
      expect(catWeight).toBeLessThanOrEqual(1);
    });
  });
});
