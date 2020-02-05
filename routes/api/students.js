const express = require('express');
const utilities = require('../../lib/utilities');
const student = require('../../models/student');
const classwork = require('../../models/classwork');
const grade = require('../../models/grade');

const router = express.Router();
// TODO: automate hostname for prod/dev
const rootUrl = 'http://localhost:3001/api/v1/students';
// regex for studentId param format
const reStudentId = /^\d{6}$/;
// regex for runId param format
const reRunId = /^[0-6]$/;

router.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`${new Date().toUTCString()}  ${req.method}  ${req.originalUrl}`);
  next();
});

/**
 * Get all student records.
 */
router.get('/', (req, res) => {
  const students = student.getAllStudentRecords();
  const schoolYear = utilities.getSchoolYear();

  try {
    const records = Object.keys(students).reduce((acc, id) => {
      const studentData = students[id].year[schoolYear];

      acc.push({
        id,
        name: students[id].name,
        grade: studentData.grade,
        school: studentData.building,
        student_url: `${rootUrl}/${id}`
      });

      return acc;
    }, []);

    res.status(200).json(records);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Get student record.
 *
 * @param {number}  studentId   The school-provided student identifier.
 */
router.get('/:studentId', (req, res) => {
  const { studentId } = req.params;
  const studentData = student.getStudentRecord(studentId);

  if (reStudentId.test(studentId)) {
    res.status(200).json({
      id: studentId,
      name: studentData.name,
      grade: studentData.grade,
      school: studentData.building,
      assignments_url: `${rootUrl}/${studentId}/assignments`,
      grades_url: `${rootUrl}/${studentId}/grades`,
      grades_average_url: `${rootUrl}/${studentId}/grades/average`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student classwork.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @query {number}  runId       The report card run or Marking Period.
 */
router.get('/:studentId/classwork', (req, res) => {
  const { studentId } = req.params;
  const runId = reRunId.test(req.query.run) ? req.query.run : undefined;

  if (reStudentId.test(studentId)) {
    // Get assignments for most recent period, or specific run if provided
    res.status(200).json({
      id: studentId,
      name: student.getStudentRecord(studentId).name,
      assignments: classwork.getClassworkForRun(studentId, runId)
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student grades for specific Marking Period.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The report card run or Marking Period.
 */
router.get('/:studentId/grades', (req, res) => {
  const { studentId } = req.params;
  const runId = reRunId.test(req.query.run) ? req.query.run : undefined;

  if (reStudentId.test(studentId)) {
    res.status(200).json({
      id: studentId,
      name: student.getStudentRecord(studentId).name,
      course_grades: grade.getGrades(studentId, runId),
      grades_average_url: `${rootUrl}/${studentId}/grades/average?run=${runId || ''}`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student daily grade average for specific Marking Period.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The marking period. Default is current period.
 */
router.get('/:studentId/grades/average', (req, res) => {
  const { studentId } = req.params;
  const runId = reRunId.test(req.query.run) ? req.query.run : undefined;

  if (reStudentId.test(studentId)) {
    res.status(200).json({
      id: studentId,
      name: student.getStudentRecord(studentId).name,
      comments: classwork.getClassworkComments(studentId, runId),
      course_grade_average: grade.getGradesAverageGql(studentId, runId)
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

module.exports = router;
