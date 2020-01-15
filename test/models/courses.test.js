const Courses = require('../../models/courses');
const rawMockData = require('../mock/course.json');

jest.mock('../../data/course.json', () => require('../mock/course.json'));

const courseId = '0123 - 1';
const course = new Courses(courseId);

describe('/models/courses', () => {
  test('getCourse() should return course data', () => {
    expect(course.getCourse())
      .toMatchObject(rawMockData[courseId]);
  });

  test('getCategoryWeight() should return proper weight', () => {
    const cat = 'Daily';
    const catWeight = course.getCategoryWeight(cat);

    expect(catWeight)
      .toEqual(rawMockData[courseId].category[cat]);
    expect(catWeight)
      .toBeGreaterThanOrEqual(0);
    expect(catWeight)
      .toBeLessThanOrEqual(1);
  });
});
