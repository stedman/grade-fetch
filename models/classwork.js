const utilities = require('../lib/utilities');
const course = require('./course');
const classworkData = require('../data/classwork.json');

const classwork = {
  /**
   * Gets the raw student classwork data.
   *
   * @param  {number}  studentId  The student identifier
   * @return {object}  The raw student classwork data.
   */
  getClassworkRaw: (studentId) => {
    const studentClasswork = classworkData[studentId];

    if (!studentClasswork) return {};

    // Unless more years are needed, only return the most recent.
    return Object.values(studentClasswork).pop().classwork;
  },

  /**
   * Gets a student's classwork data and refines it.
   *
   * @param  {number}  studentId  The student identifier
   * @return {object}  The student classwork with enhancements.
   */
  getClassworkAll: (studentId) => {
    const rawClasswork = classwork.getClassworkRaw(studentId);

    return rawClasswork.map((work) => {
      const courseId = work.course.substring(0, 9).trim();
      // Adjust score and comment if score is 'M' (which won't calculate)
      const adjusted =
        work.score === 'M'
          ? { score: 0, comment: `[missing work] ${work.comment}` }
          : { score: work.score, comment: work.comment };
      const courseData = course.getCourse(courseId);

      return {
        due: work.dateDue,
        dueMs: new Date(work.dateDue).getTime(),
        assigned: work.dateAssign,
        courseId,
        courseName: courseData.name,
        assignment: work.assignment,
        category: work.category,
        score: adjusted.score,
        // Get matching course using first 9 chars of classwork course info.
        catWeight: courseData.category[work.category],
        comment: adjusted.comment.trim()
      };
    });
  },

  /**
   * Gets a student's classwork for specific Marking Period (report card run).
   *
   * @param  {number}  studentId                        The student identifier
   * @param  {number}  [runId=utilities.getRunIdForDate()]  The run identifier
   * @return {object}  The student classwork data object for period.
   */
  getClassworkForRun: (studentId, runId = utilities.getRunIdForDate()) => {
    if (runId === '0') {
      return classwork.getClassworkAll(studentId);
    }

    const runDateInMs = utilities.getRunDateInMs(runId);

    return classwork.getClassworkAll(studentId).filter((work) => {
      // Use only classwork in the Marking Period range
      return work.dueMs > runDateInMs.start && work.dueMs < runDateInMs.end;
    });
  },

  /**
   * Gets classwork comments for a specific Marking Period.
   *
   * @param  {number}  studentId                        The student identifier
   * @param  {number}  [runId=utilities.getRunIdForDate()]  The run identifier
   * @return {object}  The student classwork data object for period.
   */
  getClassworkComments: (studentId, runId = utilities.getRunIdForDate()) => {
    return classwork.getClassworkForRun(studentId, runId).reduce((acc, work) => {
      if (work.comment !== '') {
        acc.push({
          date: work.due,
          course: work.courseName,
          assignment: work.assignment,
          score: work.score,
          comment: work.comment
        });
      }

      return acc;
    }, []);
  }
};

module.exports = classwork;
