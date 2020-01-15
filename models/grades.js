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

      newWork.dateDueMs = (new Date(work.dateDue)).getTime();
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
        classwork[work.courseId][work.category].push(Number(work.score) * work.catWeight);
      }
    });

    const output = {};

    Object.keys(classwork).map((cId) => {
      const course = classwork[cId];

      const courseTotal = Object.keys(course).reduce((courseTotalAcc, cat) => {
        const courseCat = course[cat];
        const count = courseCat.length;
        const catTotal = courseCat.reduce((catTotalAcc, catScores) => catTotalAcc + catScores, 0);

        return courseTotalAcc + (catTotal / count);
      }, 0);

      output[cId] = courseTotal.toFixed(2);

      return output[cId];
    });

    return output;
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

    const convertToMs = (time) => (new Date(time)).getTime();

    return {
      start: convertToMs(prevRunEnd),
      end: convertToMs(intervals[runId])
    };
  }
}

module.exports = Grades;
