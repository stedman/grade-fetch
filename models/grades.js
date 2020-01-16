const intervals = require('../data/intervals.json');
const gradesData = require('../data/grades.json');
const Courses = require('./courses');

class Grades {
  /**
   * @param  {number}  studentId  The student identifier
   */
  constructor(studentId) {
    this.studentId = studentId;
  }

  /**
   * Gets all student classwork.
   *
   * @return {object}  All student classwork.
   */
  getAllStudentClasswork() {
    return gradesData[this.studentId] ? gradesData[this.studentId].classwork : {};
  }

  /**
   * Adds modified properties to student classwork data.
   *
   * @return {object}  All student classwork with enhancements.
   */
  getAllStudentClassworkEnhanced() {
    const allStudentClasswork = this.getAllStudentClasswork();

    return allStudentClasswork.map((work) => {
      const newWork = work;

      newWork.dateDueMs = new Date(work.dateDue).getTime();
      newWork.courseId = work.course.substring(0, 9).trim();

      // Get matching course using first 9 chars of classwork course info.
      const course = new Courses(newWork.courseId);

      newWork.catWeight = course.getCategoryWeight(work.category);

      return newWork;
    });
  }

  /**
   * Gets the grade snapshot.
   *
   * @param  {number}  [runId]  The run identifier
   * @return {object}  The grade snapshot.
   */
  getGradeSnapshot(runId = this.constructor.getRunIdForDate()) {
    const allStudentClasswork = this.getAllStudentClassworkEnhanced();
    const runDateInMs = this.constructor.getRunDateInMs(runId);

    const classwork = {};

    allStudentClasswork.forEach((work) => {
      if (work.dateDueMs > runDateInMs.start && work.dateDueMs < runDateInMs.end) {
        classwork[work.courseId] = classwork[work.courseId] || {};
        classwork[work.courseId][work.category] = classwork[work.courseId][work.category] || [];

        if (work.score !== '') {
          classwork[work.courseId][work.category].push(Number(work.score) * work.catWeight);
        }
      }
    });

    const courseAverageGrade = {};

    Object.keys(classwork).map((cId) => {
      const courseClasswork = classwork[cId];

      // Get all possible course categories.
      // As we loop thru the results, remove active categories.
      // Subtract the weights of the inactive categories from 1.
      // Then divide the course totals by this weight adjustment.
      const courseData = new Courses(cId).getCourse();

      const courseTotal = Object.keys(courseClasswork).reduce((courseTotalAcc, cat) => {
        const catScores = courseClasswork[cat];
        const count = catScores.length;
        const catTotal = catScores.reduce((catTotalAcc, score) => catTotalAcc + score, 0);

        delete courseData.category[cat];

        return courseTotalAcc + catTotal / count;
      }, 0);

      // Calculate weight adjustment as described above. Default to 1 if result is 0 (or undefined).
      const weightAdjustment =
        Object.values(courseData.category).reduce((catTotal, catWeight) => {
          return catTotal - catWeight;
        }, 1) || 1;

      courseAverageGrade[cId] = (courseTotal / weightAdjustment).toFixed(2);

      return courseAverageGrade[cId];
    });

    return courseAverageGrade;
  }

  /**
   * Gets the run identifier for a date.
   *
   * @param  {string}  [targetDate]  The target date. Default is today.
   * @return {number}  The current run identifier.
   */
  static getRunIdForDate(targetDate = new Date()) {
    return intervals.findIndex((runEnd, idx) => {
      const prevRunEnd = intervals[idx - 1];

      if (prevRunEnd === undefined) return false;

      const start = new Date(prevRunEnd);
      const end = new Date(runEnd);
      const target = new Date(targetDate);

      return target > start && target < end;
    });
  }

  /**
   * Gets the run date in milliseconds.
   *
   * @param  {number}  [runId]  The run identifier
   * @return {object}  The run date in milliseconds.
   */
  static getRunDateInMs(runId = this.constructor.getRunIdForDate()) {
    const prevRunEnd = intervals[runId - 1];

    if (prevRunEnd === undefined) return false;

    const convertToMs = (time) => new Date(time).getTime();

    return {
      start: convertToMs(prevRunEnd),
      end: convertToMs(intervals[runId])
    };
  }
}

module.exports = Grades;
