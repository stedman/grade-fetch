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
// regex for Marking Period param format
const reMp = /^[0-6]$/;

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
        studentUrl: `${rootUrl}/${id}`
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
      classworkUrl: `${rootUrl}/${studentId}/classwork`,
      gradesUrl: `${rootUrl}/${studentId}/grades`,
      gradesAverageUrl: `${rootUrl}/${studentId}/grades/average`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student classwork.
 *
 * @param {number}  studentId     The school-provided student identifier.
 * @query {number}  [mp=current]  The report card Marking Period.
 */
router.get('/:studentId/classwork', (req, res) => {
  const { studentId } = req.params;
  const mp = reMp.test(req.query.mp) ? req.query.mp : undefined;
  const studentRecord = student.getStudentRecord(studentId);

  if (reStudentId.test(studentId)) {
    // Get classwork for most recent period, or specific run if provided
    res.status(200).json({
      id: studentId,
      name: studentRecord === undefined ? '' : studentRecord.name,
      assignments: classwork.getScoredClassworkForMp(studentId, mp)
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student grades for specific Marking Period.
 *
 * @param {number}  studentId     The school-provided student identifier.
 * @param {number}  [mp=current]  The report card Marking Period.
 */
router.get('/:studentId/grades', (req, res) => {
  const { studentId } = req.params;
  const mp = reMp.test(req.query.mp) ? req.query.mp : undefined;
  const query = mp ? `?mp=${mp}` : '';
  const studentRecord = student.getStudentRecord(studentId);

  if (studentId !== undefined && reStudentId.test(studentId)) {
    res.status(200).json({
      id: studentId,
      name: studentRecord === undefined ? '' : studentRecord.name,
      courseGrades: grade.getGrades(studentId, mp),
      gradesAverageUrl: `${rootUrl}/${studentId}/grades/average${query}`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student daily grade average for specific Marking Period.
 *
 * @param {number}  studentId     The school-provided student identifier.
 * @param {number}  [mp=current]  The marking period. Default is current period.
 */
router.get('/:studentId/grades/average', (req, res) => {
  const { studentId } = req.params;
  const mp = reMp.test(req.query.mp) ? req.query.mp : undefined;
  const studentRecord = student.getStudentRecord(studentId);

  if (reStudentId.test(studentId)) {
    res.status(200).json({
      id: studentId,
      name: studentRecord === undefined ? '' : studentRecord.name,
      comments: classwork.getClassworkComments(studentId, mp),
      courseGradeAverage: grade.getGradesAverageGql(studentId, mp)
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

module.exports = router;
