const studentData = require('../data/student.json');

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
   * @return {object}  The student data record.
   */
  getStudentRecord: (studentId) => {
    return studentData[studentId];
  }
};

module.exports = student;
