const express = require('express');
const student = require('../../models/student');
const grade = require('../../models/grade');

const router = express.Router();
// TODO: automate hostname for prod/dev
const rootUrl = 'http://localhost:3001/api/v1/students';
// regex for studentId param format
const reStudentId = /^\d{6}$/;
// regex for runId param format
const reRunId = /^\d{1}$/;

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
router.get('/:studentId', (req, res) => {
  const { studentId } = req.params;

  if (reStudentId.test(studentId)) {
    res.status(200).json({
      id: studentId,
      name: student.getStudentRecord(studentId).name,
      assignments_url: `${rootUrl}/${studentId}/assignments{/runId}`,
      grades_url: `${rootUrl}/${studentId}/grades{/runId}`,
      grades_snapshot_url: `${rootUrl}/${studentId}/grades/snapshot{/runId}`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student assignments.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The report card run or Marking Period.
 */
router.get('/:studentId/assignments/:runId?', (req, res) => {
  const { studentId, runId } = req.params;

  if (reStudentId.test(studentId)) {
    if (runId === undefined) {
      // Get all student assignments
      res.status(200).json({
        id: studentId,
        name: student.getStudentRecord(studentId).name,
        assignments: grade.getStudentClasswork(studentId)
      });
    } else if (reRunId.test(runId)) {
      // Get assignments for specific period
      res.status(200).json({
        id: studentId,
        name: student.getStudentRecord(studentId).name,
        assignments: grade.getStudentClassworkPeriod(studentId, runId)
      });
    } else {
      res.status(400).send('Bad Request');
    }
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
router.get('/:studentId/grades/:runId?', (req, res) => {
  const { studentId, runId } = req.params;

  if (reStudentId.test(studentId)) {
    const validRunId = reRunId.test(runId) ? runId : undefined;

    res.status(200).json({
      id: studentId,
      name: student.getStudentRecord(studentId).name,
      course_grades: grade.getStudentClassworkGrades(studentId, validRunId),
      grades_snapshot_url: `${rootUrl}/${studentId}/grades/snapshot/${validRunId}`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student daily grade snapshot for specific Marking Period.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The marking period. Default is current period.
 */
router.get('/:studentId/grades/snapshot/:runId?', (req, res) => {
  const { studentId, runId } = req.params;

  if (reStudentId.test(studentId)) {
    const validRunId = reRunId.test(runId) ? runId : undefined;

    res.status(200).json({
      id: studentId,
      name: student.getStudentRecord(studentId).name,
      course_grade_average: grade.getStudentClassworkGradesAverageGql(studentId, validRunId)
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

module.exports = router;
