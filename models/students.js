const students = require('../data/student.json');

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
    return students;
  }

  /**
   * Gets a student record.
   *
   * @return {object}  The student record.
   */
  getStudentRecord() {
    return students[this.studentId];
  }
}

module.exports = Students;
