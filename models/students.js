const students = require('../data/student.json');

class Students {
  /**
   * @param  {number}  studentId  The student identifier
   */
  constructor(studentId) {
    this.studentId = studentId;
  }

  /**
   * Gets the student record.
   *
   * @return {object}  The student record.
   */
  getStudentRecord() {
    return students[this.studentId];
  }

  /**
   * Gets all student records.
   *
   * @return {object}  All student records.
   */
  static getAllStudentRecords() {
    return students;
  }
}

module.exports = Students;
