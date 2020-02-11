const student = require('../../models/student');
const classwork = require('../../models/classwork');
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

    if (Object.keys(studentData).length === 0) return {};

    return {
      id,
      name: studentData.name
    };
  },

  /**
   * Get student classwork
   *
   * @param  {String}  arg.studentId  The student identifier
   * @param  {Number}  arg.mp      The run identifier
   * @return {Array}  Student assignments
   */
  classwork: ({ studentId, mp }) => {
    return classwork.getClassworkForMp(studentId, mp);
  },

  /**
   * Get student grade average
   *
   * @param  {String}  arg.studentId  The student identifier
   * @param  {Number}  arg.mp      The run identifier
   * @return {Array}  Student grade averages per course.
   */
  gradeAverage: ({ studentId, mp }) => {
    return grade.getGradesAverageGql(studentId, mp);
  }
};

module.exports = rootValue;
