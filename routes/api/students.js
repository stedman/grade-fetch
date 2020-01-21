const express = require('express');
const student = require('../../models/student');
const grade = require('../../models/grade');

const router = express.Router();
// TODO: automate hostname for prod/dev
const rootUrl = 'http://localhost:3001/api/v1/students';

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
  const studentRecords = [];

  Object.keys(students).forEach((id) => {
    studentRecords.push({
      id,
      name: students[id].name,
      student_url: `${rootUrl}/${id}`
    });
  });

  res.status(200).json(studentRecords);
});

/**
 * Get student record.
 *
 * @param {number}  studentId   The school-provided student identifier.
 */
router.get('/:studentId([0-9]{6})', (req, res) => {
  const { studentId } = req.params;

  res.status(200).json({
    id: studentId,
    name: student.getStudentRecord(studentId).name,
    assignments_url: `${rootUrl}/${studentId}/assignments{/rundId}`,
    grades_url: `${rootUrl}/${studentId}/grades{/runId}`,
    grades_snapshot_url: `${rootUrl}/${studentId}/grades/snapshot{/runId}`
  });
});

/**
 * Get all student assignments.
 *
 * @param {number}  studentId   The school-provided student identifier.
 */
router.get('/:studentId([0-9]{6})/assignments', (req, res) => {
  const { studentId } = req.params;

  res.status(200).json({
    id: studentId,
    name: student.getStudentRecord(studentId).name,
    assignments: grade.getStudentClasswork(studentId)
  });
});

/**
 * Get student assignments for specific Marking Period.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The report card run or Marking Period.
 */
router.get('/:studentId([0-9]{6})/assignments/:runId([0-9]{1})?', (req, res) => {
  const { studentId } = req.params;

  res.status(200).json({
    id: studentId,
    name: student.getStudentRecord(studentId).name,
    assignments: grade.getStudentClassworkPeriod(studentId, req.params.runId)
  });
});

/**
 * Get student grades for specific Marking Period.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The report card run or Marking Period.
 */
router.get('/:studentId([0-9]{6})/grades/:runId([0-9]{1})?', (req, res) => {
  const { studentId } = req.params;

  res.status(200).json({
    id: studentId,
    name: student.getStudentRecord(studentId).name,
    course_grades: grade.getStudentClassworkGrades(studentId, req.params.runId),
    grades_snapshot_url: `${rootUrl}/${studentId}/grades/snapshot/${req.params.runId}`
  });
});

/**
 * Get student daily grade snapshot for specific Marking Period.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The marking period. Default is current period.
 */
router.get('/:studentId([0-9]{6})/grades/snapshot/:runId([0-9]{1})?', (req, res) => {
  const { studentId } = req.params;

  res.status(200).json({
    id: studentId,
    name: student.getStudentRecord(studentId).name,
    course_grade_average: grade.getStudentClassworkGradesAverage(studentId, req.params.runId)
  });
});

module.exports = router;
