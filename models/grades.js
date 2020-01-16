const classworkData = require('../data/classwork.json');
const intervalData = require('../data/intervals.json');
const Courses = require('./courses');

class Grades {
  /**
   * @param  {number}  studentId  The student identifier
   */
  constructor(studentId) {
    this.studentId = studentId;
  }

  /**
   * Gets all student classwork directly from fetched data.
   *
   * @return {object}  All student classwork.
   */
  getStudentClassworkData() {
    return classworkData[this.studentId] ? classworkData[this.studentId].classwork : {};
  }

  /**
   * Gets student classwork.
   *
   * @return {object}  All student classwork with enhancements.
   */
  getStudentClasswork() {
    const allStudentClasswork = this.getStudentClassworkData();

    const stuff = allStudentClasswork.map((work) => {
      const newWork = work;

      newWork.dateDueMs = new Date(work.dateDue).getTime();
      newWork.courseId = work.course.substring(0, 9).trim();

      // Get matching course using first 9 chars of classwork course info.
      const course = new Courses(newWork.courseId);

      newWork.catWeight = course.getCourse().category[work.category];

      return newWork;
    });

    return stuff;
  }

  /**
   * Gets a student's classwork for specific Marking Period (report card run).
   *
   * @param  {number}  [runId]  The run identifier (Marking Period)
   * @return {object}  The classwork within a Marking Period range.
   */
  getStudentClassworkPeriod(runId = this.constructor.getRunIdForDate()) {
    const runDateInMs = this.constructor.getRunDateInMs(runId);

    return this.getStudentClasswork().filter((work) => {
      // Use only classwork in the Marking Period range
      return work.dateDueMs > runDateInMs.start && work.dateDueMs < runDateInMs.end;
    });
  }

  /**
   * Gets grades for classwork grouped into course and category.
   *
   * @param  {number}  [runId]  The run identifier (Marking Period)
   * @return {object}  The grade snapshot.
   */
  getStudentClassworkGrades(runId = this.constructor.getRunIdForDate()) {
    const classwork = {};

    this.getStudentClassworkPeriod(runId).forEach((work) => {
      classwork[work.courseId] = classwork[work.courseId] || {};
      classwork[work.courseId][work.category] = classwork[work.courseId][work.category] || [];

      if (work.score !== '') {
        classwork[work.courseId][work.category].push(Number(work.score));
      }
    });

    return classwork;
  }

  /**
   * Gets weighted grades for classwork grouped into course and category.
   *
   * @param  {number}  [runId]  The run identifier
   * @return {object}  The grade snapshot.
   */
  getStudentClassworkGradesWeighted(runId = this.constructor.getRunIdForDate()) {
    const classwork = {};

    this.getStudentClassworkPeriod(runId).forEach((work) => {
      classwork[work.courseId] = classwork[work.courseId] || {};
      classwork[work.courseId][work.category] = classwork[work.courseId][work.category] || [];

      if (work.score !== '') {
        classwork[work.courseId][work.category].push(Number(work.score) * work.catWeight);
      }
    });

    return classwork;
  }

  /**
   * Gets the grade average for classwork in the Marked Period.
   *
   * @param  {number}  [runId]  The run identifier
   * @return {object}  The grade snapshot.
   */
  getStudentClassworkGradesAverage(runId = this.constructor.getRunIdForDate()) {
    const classwork = this.getStudentClassworkGradesWeighted(runId);
    const courseAverageGrade = {};

    Object.keys(classwork).map((cId) => {
      const courseClasswork = classwork[cId];

      // Get all possible course categories.
      // As we loop thru the results, remove active categories.
      // Subtract the weights of the inactive categories from 1.
      // Then divide the course totals by this weight adjustment.
      const courseData = new Courses(cId).getCourse().category;
      const courseCatClone = { ...courseData };

      const courseTotal = Object.keys(courseClasswork).reduce((courseTotalAcc, cat) => {
        const catScores = courseClasswork[cat];
        const count = catScores.length;
        const catTotal = catScores.reduce((catTotalAcc, score) => {
          return catTotalAcc + score;
        }, 0);

        delete courseCatClone[cat];

        return courseTotalAcc + catTotal / count;
      }, 0);

      // Calculate weight adjustment as described above. Default to 1 if result is 0 (or undefined).
      const weightAdjustment =
        Object.values(courseCatClone).reduce((catTotal, catWeight) => {
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
    return intervalData.findIndex((runEnd, idx) => {
      const prevRunEnd = intervalData[idx - 1];

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
    const prevRunEnd = intervalData[runId - 1];

    if (prevRunEnd === undefined) return false;

    const convertToMs = (time) => new Date(time).getTime();

    return {
      start: convertToMs(prevRunEnd),
      end: convertToMs(intervalData[runId])
    };
  }
}

module.exports = Grades;
