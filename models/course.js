const courseData = require('../data/course.json');

const course = {
  /**
   * Gets the course.
   *
   * @param  {string}  courseId  The course identifier
   * @return {object}  The course data object.
   */
  getCourse: (courseId) => {
    return courseData[courseId];
  },
  /**
   * Gets the category weight for specific course and category.
   *
   * @param  {string}  courseId      The course identifier
   * @param  {string}  categoryName  The category name
   * @return {number}  The category weight.
   */
  getCategoryWeight: (courseId, categoryName) => {
    return course.getCourse(courseId).category[categoryName];
  }
};

module.exports = course;
