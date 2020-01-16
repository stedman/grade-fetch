const courses = require('../data/course.json');

class Courses {
  /**
   * @param  {string}  courseId  The course identifier
   */
  constructor(courseId) {
    this.courseId = courseId;
  }

  /**
   * Gets the course.
   *
   * @return {object}  The course.
   */
  getCourse() {
    return courses[this.courseId];
  }

  /**
   * Gets the scoring weight for specific course and category.
   *
   * @param  {string}  catName  The category name
   * @return {number}  The category weight.
   */
  getCategoryWeight(catName) {
    return this.getCourse().category[catName];
  }
}

module.exports = Courses;
