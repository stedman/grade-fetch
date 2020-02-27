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
   *
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
   * @param  {String}  arg.studentId    The student identifier
   * @param  {Number}  [arg.runId]      Get records for this Grading Period
   * @param  {String}  [arg.runDate]    Get records for this date within Grading Period
   * @param  {Boolean} [arg.all]        Get all records
   *
   * @return {Array}  Student assignments
   */
  classwork: ({ studentId, runId, runDate, all }) => {
    const studentData = student.getStudentRecord(studentId);
    const gradingPeriod = {
      key: studentData.gradingPeriodKey,
      id: runId,
      date: runDate,
      isAll: all
    };
    const workRecord = classwork.getGradingPeriodRecords(studentId, gradingPeriod);

    return Object.entries(workRecord).map(([courseId, courseData]) => {
      return {
        courseId,
        courseName: courseData.courseName,
        assignments: courseData.classwork
      };
    });
  },

  /**
   * Get student grade average
   *
   * @param  {String}  arg.studentId    The student identifier
   * @param  {Number}  [arg.runId]      Get records for this Grading Period
   * @param  {String}  [arg.runDate]    Get records for this date within Grading Period
   * @param  {Boolean} [arg.all]        Get all records
   *
   * @return {Array}  Student grade averages per course.
   */
  gradeAverage: ({ studentId, runId, runDate, all }) => {
    const studentData = student.getStudentRecord(studentId);
    const gradingPeriod = {
      key: studentData.gradingPeriodKey,
      id: runId,
      date: runDate,
      isAll: all
    };

    const gradeRecord = grade.getGradeAverage(studentId, gradingPeriod);
    const grades = Object.entries(gradeRecord)
      .map(([courseId, courseData]) => {
        return {
          courseId,
          courseName: courseData.courseName,
          average: courseData.average
        };
      })
      .filter((course) => {
        return !!course.average;
      });

    return grades;
  }
};

module.exports = rootValue;
