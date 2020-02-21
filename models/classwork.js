const utilities = require('../lib/utilities');
const course = require('./course');
const classworkData = require('../data/classwork.json');

// regex for studentId param format
const reStudentId = /^\d{6}$/;

const classwork = {
  /**
   * Gets the raw student classwork data.
   *
   * @param  {number}  studentId  The student identifier
   * @return {array}   The raw student classwork data.
   */
  getClassworkRaw: (studentId) => {
    const studentClasswork = classworkData[studentId];

    if (studentId === undefined || !reStudentId.test(studentId) || studentClasswork === undefined) {
      return [];
    }

    // Unless more years are needed, only return the most recent.
    return studentClasswork.classwork;
  },

  /**
   * Gets a student's classwork data and refines it.
   *
   * @param  {number}  studentId  The student identifier
   * @return {array}   The student classwork with enhancements.
   */
  getClassworkAll: (studentId) => {
    const rawClasswork = classwork.getClassworkRaw(studentId);

    if (studentId === undefined || !reStudentId.test(studentId) || rawClasswork === undefined) {
      return [];
    }

    return rawClasswork.map((work) => {
      // Get matching course using first 9 chars of classwork course info.
      const courseId = work.course.substring(0, 9).trim();
      // Adjust score and comment if score is 'M' (which won't calculate)
      const adjusted =
        work.score === 'M'
          ? { score: 0, comment: `[missing work] ${work.comment}` }
          : { score: work.score, comment: work.comment };
      const courseData = course.getCourse(courseId);

      const catWeight = courseData.category[work.category];

      if (catWeight === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          `Category showed up in classwork, but is not a course category:
          ${courseId} - ${work.category} - ${catWeight}`
        );
        throw new Error('Category showed up in classwork, but is not a course category.');
      }

      return {
        due: work.dateDue,
        dueMs: new Date(work.dateDue).getTime(),
        assigned: work.dateAssign,
        courseId,
        courseName: courseData.name,
        assignment: work.assignment,
        category: work.category,
        score: adjusted.score === '' ? '' : +adjusted.score,
        catWeight,
        comment: adjusted.comment.trim()
      };
    });
  },

  /**
   * Gets a student's classwork for specific Marking Period (report card run).
   *
   * @param  {number}  studentId    The student identifier
   * @param  {number}  [mp]         The marking period
   * @return {array}  The student classwork data for period.
   */
  getClassworkForMp: (studentId, mp) => {
    // We'll use Marking Period "0" to request ALL records.
    if (mp === '0') {
      return classwork.getClassworkAll(studentId);
    }

    const mpInterval = utilities.getMpIntervals(mp);
    const allClasswork = classwork.getClassworkAll(studentId);

    return allClasswork.filter((work) => {
      // Use only classwork in the Marking Period range
      return work.dueMs >= mpInterval.start && work.dueMs <= mpInterval.end;
    });
  },

  /**
   * Gets a student's classwork for specific Marking Period (report card run).
   *
   * @param  {number}  studentId    The student identifier
   * @param  {number}  [mp]         The marking period
   * @return {array}  The student classwork data for period.
   */
  getScoredClassworkForMp: (studentId, mp) => {
    // We'll use Marking Period "0" to request ALL records.
    if (mp === '0') {
      return classwork.getClassworkAll(studentId);
    }

    const mpInterval = utilities.getMpIntervals(mp);
    const allClasswork = classwork.getClassworkAll(studentId);

    return allClasswork.filter((work) => {
      // Use only classwork in the Marking Period range
      const inRange = work.dueMs >= mpInterval.start && work.dueMs <= mpInterval.end;
      const hasScore = work.score !== '';

      return inRange && hasScore;
    });
  },

  /**
   * Gets a student's classwork for specific Marking Period grouped by course.
   *
   * @param  {number}  studentId    The student identifier
   * @param  {number}  [mp]         The marking period
   * @return {object}  The student classwork data for period.
   */
  getScoredClassworkForMpByCourse: (studentId, mp) => {
    const scoredClasswork = classwork.getScoredClassworkForMp(studentId, mp);

    return scoredClasswork.reduce((acc, work) => {
      acc[work.courseId] = acc[work.courseId] || [];

      acc[work.courseId].push({
        due: work.due,
        dueMs: work.dueMs,
        courseName: work.courseName,
        assignment: work.assignment,
        score: work.score
      });

      return acc;
    }, {});
  },

  /**
   * Gets classwork alerts for low scores and comments for a specific Marking Period.
   *
   * @param  {number}  studentId    The student identifier
   * @param  {number}  [mp          The marking period
   * @return {object}  The student classwork data object for period.
   */
  getClassworkAlerts: (studentId, mp) => {
    return classwork.getClassworkForMp(studentId, mp).reduce((acc, work) => {
      if (work.comment !== '' || (work.score < 70 && work.score !== '')) {
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
