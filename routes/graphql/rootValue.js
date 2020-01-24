const student = require('../../models/student');
const grade = require('../../models/grade');

const rootValue = {
  /**
   * Get all student records.
   *
   * @return {Array}  Student records
   */
  students: () => {
    const students = student.getAllStudentRecords();
    const studentRecords = [];

    Object.keys(students).forEach((id) => {
      studentRecords.push({
        id,
        name: students[id].name
      });
    });

    return studentRecords;
  },

  /**
   * Get individual student record.
   *
   * @param  {String}  arg.id  The Student identifier
   * @return {Object}  { description_of_the_return_value }
   */
  student: ({ id }) => {
    const studentData = student.getStudentRecord(id);

    if (studentData === undefined) throw Error('Student ID does not match any record.');

    return {
      id,
      name: studentData.name
    };
  },

  /**
   * Get student assignments
   *
   * @param  {String}  arg.studentId  The student identifier
   * @param  {Number}  arg.runId      The run identifier
   * @return {Array}  Student assignments
   */
  assignments: ({ studentId, runId }) => {
    if (runId) {
      return grade.getStudentClassworkPeriodGql(studentId, runId);
    }

    return grade.getStudentClassworkGql(studentId);
  },

  /**
   * Get student grade average
   *
   * @param  {String}  arg.studentId  The student identifier
   * @param  {Number}  arg.runId      The run identifier
   * @return {Array}  Student grade averages per course.
   */
  grade_average: ({ studentId, runId }) => {
    if (runId) {
      return grade.getStudentClassworkGradesAverageGql(studentId, runId);
    }

    return grade.getStudentClassworkGradesAverageGql(studentId);
  }
};

module.exports = rootValue;
