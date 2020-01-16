const studentData = require('../data/student.json');

class Students {
  /**
   * @param  {number}  studentId  The student identifier
   */
  constructor(studentId) {
    this.studentId = studentId;
  }

  /**
   * Gets all student records.
   *
   * @return {object}  All student records.
   */
  static getAllStudentRecords() {
    return studentData;
  }

  /**
   * Gets a student record.
   *
   * @return {object}  The student record.
   */
  getStudentRecord() {
    return studentData[this.studentId];
  }
}

module.exports = Students;
