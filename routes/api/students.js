const express = require('express');
const period = require('../../models/period');
const student = require('../../models/student');
const classwork = require('../../models/classwork');
const grade = require('../../models/grade');

const router = express.Router();
// TODO: automate hostname for prod/dev
const rootUrl = 'http://localhost:3001/api/v1/students';
// regex for studentId param format
const reStudentId = /^\d{6}$/;
// regex for Marking Period param format
const reRunId = /^[0-6]$/;
const reRunDate = /^\d{1,2}[-/]\d{1,2}[-/]20\d{2}$/;

/**
 * Get all student records.
 */
router.get('/', (req, res) => {
  const students = student.getAllStudentRecords();

  try {
    const records = Object.keys(students).reduce((acc, id) => {
      const studentRecord = students[id];
      const periodKey = studentRecord.gradingPeriodKey;
      const gradingPeriod = period.getGradingPeriodIndex({ key: periodKey });

      acc.push({
        id: +id,
        name: students[id].name,
        grade: studentRecord.grade,
        gradingPeriod,
        school: studentRecord.building,
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
  const studentRecord = student.getStudentRecord(studentId);
  const periodKey = studentRecord.gradingPeriodKey;
  const gradingPeriod = period.getGradingPeriodIndex({ key: periodKey });

  if (reStudentId.test(studentId)) {
    res.status(200).json({
      id: +studentId,
      name: studentRecord.name,
      grade: studentRecord.grade,
      gradingPeriod,
      building: studentRecord.building,
      homeroom: studentRecord.homeroom,
      courses: studentRecord.courses,
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
 * @param {Number}  [query.runId]    Get records for this Grading Period
 * @param {String}  [query.runDate]  Get records for this date within Grading Period
 * @param {Boolean} [query.all]      Get all records
 */
router.get('/:studentId/classwork', (req, res) => {
  const { studentId } = req.params;

  if (reStudentId.test(studentId)) {
    const studentRecord = student.getStudentRecord(studentId);
    const periodKey = studentRecord.gradingPeriodKey;
    const runId = reRunId.test(req.query.runId) ? req.query.runId : undefined;
    const runDate = reRunDate.test(req.query.runDate) ? req.query.runDate : undefined;
    const runAll = req.query.all !== undefined;
    const gradingPeriod = {
      key: periodKey,
      id: runId,
      date: runDate,
      isAll: runAll
    };

    // Get classwork for most recent period, or specific run if provided
    res.status(200).json({
      studentId: +studentId,
      studentName: studentRecord === undefined ? '' : studentRecord.name,
      interval: period.getGradingPeriodInterval(gradingPeriod),
      course: classwork.getGradingPeriodRecords(studentId, gradingPeriod)
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student grades for specific Grading Period.
 *
 * @param {number}  studentId     The school-provided student identifier.
 * @param {Number}  [query.runId]    Get records for this Grading Period
 * @param {String}  [query.runDate]  Get records for this date within Grading Period
 * @param {Boolean} [query.all]      Get all records
 */
router.get('/:studentId/grades', (req, res) => {
  const { studentId } = req.params;

  if (reStudentId.test(studentId)) {
    const studentRecord = student.getStudentRecord(studentId);
    const periodKey = studentRecord.gradingPeriodKey;
    const runId = reRunId.test(req.query.runId) ? req.query.runId : undefined;
    const runDate = reRunDate.test(req.query.runDate) ? req.query.runDate : undefined;
    const runAll = req.query.all !== undefined;
    const gradingPeriod = {
      key: periodKey,
      id: runId,
      date: runDate,
      isAll: runAll
    };
    // Build up query string for HATEOS link.
    let query = '';
    const queries = Object.entries(req.query);
    if (queries.length) {
      query = `?${queries.join('&').replace(',', '=')}`;
    }

    res.status(200).json({
      studentId: +studentId,
      studentName: studentRecord === undefined ? '' : studentRecord.name,
      courseGrades: grade.getGrades(studentId, gradingPeriod),
      gradesAverageUrl: `${rootUrl}/${studentId}/grades/average${query}`
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Get student daily grade average for specific Grading Period.
 *
 * @param {number}  studentId     The school-provided student identifier.
 * @param {Number}  [query.runId]    Get records for this Grading Period
 * @param {String}  [query.runDate]  Get records for this date within Grading Period
 * @param {Boolean} [query.all]      Get all records
 */
router.get('/:studentId/grades/average', (req, res) => {
  const { studentId } = req.params;

  if (reStudentId.test(studentId)) {
    const studentRecord = student.getStudentRecord(studentId);
    const periodKey = studentRecord.gradingPeriodKey;
    const runId = reRunId.test(req.query.runId) ? req.query.runId : undefined;
    const runDate = reRunDate.test(req.query.runDate) ? req.query.runDate : undefined;
    const runAll = req.query.all !== undefined;
    const gradingPeriod = {
      key: periodKey,
      id: runId,
      date: runDate,
      isAll: runAll
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

    res.status(200).json({
      studentId: +studentId,
      studentName: studentRecord === undefined ? '' : studentRecord.name,
      alerts: classwork.getClassworkAlerts(studentId, gradingPeriod),
      grades
    });
  } else {
    res.status(400).send('Bad Request');
  }
});

module.exports = router;
