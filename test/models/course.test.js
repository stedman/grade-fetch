const courses = require('../../models/course');
const rawMockData = require('../mock/course.json');

jest.mock('../../data/course.json', () => require('../mock/course.json'));

const courseId = '0123 - 1';

describe('/models/courses', () => {
  describe('getCourse()', () => {
    test('should return course data', () => {
      expect(courses.getCourse(courseId)).toMatchObject(rawMockData[courseId]);
    });
  });

  describe('getCategoryWeight()', () => {
    test('should return proper weight', () => {
      const cat = 'Daily';
      const catWeight = courses.getCategoryWeight(courseId, cat);

      expect(catWeight).toEqual(rawMockData[courseId].category[cat]);
      expect(catWeight).toBeGreaterThanOrEqual(0);
      expect(catWeight).toBeLessThanOrEqual(1);
    });
  });
});
