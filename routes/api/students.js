const express = require('express');
const Students = require('../../models/students');
const Grades = require('../../models/grades');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Time:', (new Date()).toUTCString());
  next();
});

/**
 * Get all student records.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Student records.',
    students: Students.getAllStudentRecords()
  });
});

/**
 * Get student record.
 *
 * @param {number}  studentId   The school-provided student identifier.
 */
router.get('/:studentId([0-9]{6})', (req, res) => {
  const student = new Students(req.params.studentId);

  res.status(200).json({
    message: `Records for student: ${req.params.studentId}`,
    studentId: req.params.studentId,
    studentName: student.getStudentRecord().name
  });
});

/**
 * TODO: Get student grades.
 *
 * @param {number}  studentId   The school-provided student identifier.
 */
router.get('/:studentId([0-9]{6})/grades', (req, res) => {
  const student = new Students(req.params.studentId);

  res.status(200).json({
    message: `Grades for student: ${req.params.studentId}`,
    studentId: req.params.studentId,
    studentName: student.getStudentRecord().name
  });
});

/**
 * Get all student assignment records.
 *
 * @param {number}  studentId   The school-provided student identifier.
 */
router.get('/:studentId([0-9]{6})/assignments', (req, res) => {
  const student = new Students(req.params.studentId);
  const grades = new Grades(req.params.studentId);

  res.status(200).json({
    message: `Assignments for student: ${req.params.studentId}`,
    studentId: req.params.studentId,
    studentName: student.getStudentRecord().name,
    grades: grades.augmentAllStudentClasswork()
  });
});

/**
 * Get student daily grade snapshot for current run.
 *
 * @param {number}  studentId   The school-provided student identifier.
 * @param {number}  runId       The marking period. Default is current period.
 */
router.get('/:studentId([0-9]{6})/grades/snapshot/:runId([0-9]{1})?', (req, res) => {
  const student = new Students(req.params.studentId);
  const grades = new Grades(req.params.studentId);

  res.status(200).json({
    message: `Today's class grade average for student: ${req.params.studentId}`,
    studentId: req.params.studentId,
    studentName: student.getStudentRecord().name,
    snapshot: grades.getGradeSnapshot(req.params.runId)
  });
});

module.exports = router;
