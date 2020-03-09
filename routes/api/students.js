const express = require('express');
const student = require('../../controllers/student');

const router = express.Router();

router.get('/', student.getAll);
router.get('/:studentId', student.getStudent);
router.get('/:studentId/classwork', student.getClasswork);
router.get('/:studentId/grades', student.getGrades);
router.get('/:studentId/grades/average', student.getGradeAverages);

module.exports = router;
