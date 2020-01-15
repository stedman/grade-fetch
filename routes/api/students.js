const express = require('express');
const Students = require('../../models/students');
const Grades = require('../../models/grades');

const router = express.Router();
// TODO: automate hostname for prod/dev
const rootUrl = 'http://localhost:3000/api/v1/students';

router.use((req, res, next) => {
  console.log('Time:', (new Date()).toUTCString());
  next();
});

/**
 * Get all student records.
 */
router.get('/', (req, res) => {
  const students = Students.getAllStudentRecords();
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
  const student = new Students(req.params.studentId);

  res.status(200).json({
    id: req.params.studentId,
    name: student.getStudentRecord().name,
    assignments_url: `${rootUrl}/${req.params.studentId}/assignments`,
    grades_url: `${rootUrl}/${req.params.studentId}/grades`,
    grades_snapshot_url: `${rootUrl}/${req.params.studentId}/grades/snapshot{/runId}`
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
    id: req.params.studentId,
    name: student.getStudentRecord().name,
    assignments: grades.augmentAllStudentClasswork()
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
    message: 'TODO: Grades for student',
    id: req.params.studentId,
    name: student.getStudentRecord().name
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
    id: req.params.studentId,
    name: student.getStudentRecord().name,
    snapshot: grades.getGradeSnapshot(req.params.runId)
  });
});

module.exports = router;
