const classwork = require('./classwork');
const course = require('./course');
const utilities = require('../lib/utilities');

const grade = {
  /**
   * Gets grades for classwork grouped into course and category.
   *
   * @param  {number}  studentId                        The student identifier
   * @param  {number}  [runId=utilities.getRunIdForDate()]  The run identifier
   * @return {object}  The student classwork grades data.
   */
  getGrades: (studentId, runId = utilities.getRunIdForDate()) => {
    return classwork.getClassworkForRun(studentId, runId).reduce((acc, work) => {
      if (work.score !== '') {
        acc[work.courseId] = acc[work.courseId] || {};
        acc[work.courseId][work.category] = acc[work.courseId][work.category] || [];
        acc[work.courseId][work.category].push(Number(work.score));
      }
      return acc;
    }, {});
  },

  /**
   * Gets weighted grades for classwork grouped into course and category.
   *
   * @param  {number}  studentId                        The student identifier
   * @param  {number}  [runId=utilities.getRunIdForDate()]  The run identifier
   * @return {object}  The student classwork grades data weighted.
   */
  getGradesWeighted: (studentId, runId = utilities.getRunIdForDate()) => {
    return classwork.getClassworkForRun(studentId, runId).reduce((acc, work) => {
      if (work.score !== '') {
        acc[work.courseId] = acc[work.courseId] || {};
        acc[work.courseId][work.category] = acc[work.courseId][work.category] || [];
        acc[work.courseId][work.category].push(Number(work.score) * work.catWeight);
      }
      return acc;
    }, {});
  },

  /**
   * Gets the grade average for classwork in the Marked Period.
   *
   * @param  {number}  studentId                        The student identifier
   * @param  {number}  [runId=utilities.getRunIdForDate()]  The run identifier
   * @return {object}  The student classwork grades average grade data.
   */
  getGradesAverage: (studentId, runId = utilities.getRunIdForDate()) => {
    const weightedClasswork = grade.getGradesWeighted(studentId, runId);
    const courseAverageGrade = {};

    Object.keys(weightedClasswork).forEach((cId) => {
      const courseClasswork = weightedClasswork[cId];

      // Get all possible course categories.
      // As we loop thru the results, remove categories found in classwork.
      // Subtract the weights of the inactive categories from 1.
      // Then divide the course totals by this weight adjustment.
      const courseData = course.getCourse(cId).category;
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
  },

  /**
   * Gets the grade average for classwork in the Marked Period.
   * Formatted for GraphQL.
   *
   * @param  {number}  studentId                        The student identifier
   * @param  {number}  [runId=utilities.getRunIdForDate()]  The run identifier
   * @return {array}  The student classwork grades average grade data.
   */
  getGradesAverageGql: (studentId, runId = utilities.getRunIdForDate()) => {
    const gradesAverage = grade.getGradesAverage(studentId, runId);

    return Object.entries(gradesAverage).map(([cId, avg]) => {
      return {
        courseId: cId,
        courseName: course.getCourse(cId).name,
        average: avg
      };
    });
  }
};

module.exports = grade;
