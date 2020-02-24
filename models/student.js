const studentData = require('../data/student.json');
const utilities = require('../lib/utilities');

const student = {
  /**
   * Gets all student records.
   *
   * @return {object}  All student records.
   */
  getAllStudentRecords: () => {
    return studentData;
  },

  /**
   * Gets the student record.
   *
   * @param  {number}  studentId  The student identifier
   *
   * @return {object}  The student data record.
   */
  getStudentRecord: (studentId) => {
    if (studentId === undefined) {
      return {};
    }

    const studentRecord = studentData[studentId] || {};

    if (studentRecord.grade) {
      studentRecord.gradingPeriodKey = utilities.getGradingPeriodKey(studentRecord.grade);
    }

    return studentRecord;
  }
};

module.exports = student;
