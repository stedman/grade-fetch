const period = require('../models/period');
const grades = require('../data/grades.json');

// regex for studentId param format
const reStudentId = /^\d{6}$/;

const classwork = {
  /**
   * Gets the raw student classwork record.
   *
   * @param  {number}  studentId  The student identifier
   *
   * @return {array}   The raw student classwork data.
   */
  getAllRecordsRaw: (studentId) => {
    const studentRecord = grades[studentId];

    if (!reStudentId.test(studentId) || studentRecord === undefined) {
      return {};
    }

    return studentRecord.course;
  },

  /**
   * Get a student's classwork data and refine it.
   *
   * @param  {number}  studentId  The student identifier
   *
   * @return {object}   The formatted student course data.
   */
  getAllRecords: (studentId) => {
    const rawRecord = classwork.getAllRecordsRaw(studentId);
    const recordEntries = Object.entries(rawRecord);
    const studentRecord = {};

    if (recordEntries.length === 0) {
      return studentRecord;
    }

    recordEntries.forEach(([courseId, courseData]) => {
      const courseName = courseData.name;

      studentRecord[courseId] = {
        name: courseName,
        categoryTotal: courseData.categoryTotal,
        category: courseData.category
      };

      if (courseData.classwork) {
        const assignments = courseData.classwork
          .filter((work) => {
            // Don't bother with assignments that haven't been graded yet.
            return work.score !== '';
          })
          .map((work) => {
            const comment = work.score === 'M' ? `[missing work] ${work.comment}` : work.comment;

            return {
              dateDue: work.dateDue,
              dateDueMs: new Date(work.dateDue).getTime(),
              dateAssigned: work.dateAssigned,
              assignment: work.assignment,
              category: work.category,
              score: work.score,
              weightedScore: work.weightedScore,
              weightedTotalPoints: work.weightedTotalPoints,
              comment: comment.trim()
            };
          });

        studentRecord[courseId].classwork = assignments;
      }
    });

    return studentRecord;
  },

  /**
   * Gets a student's classwork for specific Grading Period (report card run).
   *
   * @param  {number}  studentId      The student identifier
   * @param  {number}  [periodIndex]  The Grading Period index
   * @param  {number}  [periodKey]    The Grading Period key
   *
   * @return {object}  The student course data for period.
   */
  getGradingPeriodRecords: (studentId, periodIndex, periodKey) => {
    const fullRecord = classwork.getAllRecords(studentId);

    // We'll use Grading Period "0" to request ALL records.
    if (periodIndex === '0') {
      return fullRecord;
    }

    const recordEntries = Object.entries(fullRecord);
    const studentRecord = {};

    if (recordEntries.length === 0) {
      return studentRecord;
    }

    const interval = period.getGradingPeriodTime(periodIndex, periodKey);

    recordEntries.forEach(([courseId, courseData]) => {
      const courseName = courseData.name;

      studentRecord[courseId] = {
        name: courseName,
        categoryTotal: courseData.categoryTotal,
        category: courseData.category
      };

      if (courseData.classwork) {
        const assignments = courseData.classwork.filter((work) => {
          // Use only classwork in the Grading Period range
          return (
            work.dateDueMs && work.dateDueMs >= interval.start && work.dateDueMs <= interval.end
          );
        });

        studentRecord[courseId].classwork = assignments;
      }
    });

    return studentRecord;
  },

  /**
   * Gets classwork alerts for low scores and comments for a specific Grading Period.
   *
   * @param  {number}  studentId      The student identifier
   * @param  {number}  [periodIndex]  The Grading Period index
   * @param  {number}  [periodKey]    The Grading Period key
   *
   * @return {array}  Assignments with comments or low scores.
   */
  getClassworkAlerts: (studentId, periodIndex, periodKey) => {
    const lowScore = 70;
    const gradingPeriodRecord = classwork.getGradingPeriodRecords(
      studentId,
      periodIndex,
      periodKey
    );
    const recordEntries = Object.entries(gradingPeriodRecord);
    const alerts = [];

    if (recordEntries.length === 0) {
      return alerts;
    }

    recordEntries.forEach(([courseId, courseData]) => {
      const courseName = courseData.name;

      courseData.classwork.forEach((work) => {
        if (work.comment !== '' || work.score < lowScore) {
          alerts.push({
            date: work.dateDue,
            course: courseName,
            assignment: work.assignment,
            score: work.score,
            comment: work.comment
          });
        }
      });
    });

    return alerts;
  }
};

module.exports = classwork;
