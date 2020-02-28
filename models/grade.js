const classwork = require('./classwork');

const grade = {
  /**
   * Gets grades for classwork grouped into course and category.
   *
   * @param  {number}  studentId      The student identifier
   * @param  {object}  gradingPeriod  The Grading Period object
   * @param  {Number}  [..key]        Grading Period key for student grade level
   * @param  {Number}  [..id]         Get records for this Grading Period
   * @param  {String}  [..date]       Get records for this date within Grading Period
   * @param  {Boolean} [..isAll]      Need all records?
   *
   * @return {object}  The student classwork grades data.
   */
  getGrades: (studentId, gradingPeriod = {}) => {
    const studentRecord = classwork.getGradingPeriodRecords(studentId, gradingPeriod);

    if (!studentRecord) {
      return {};
    }

    const courseEntries = Object.entries(studentRecord);
    const gradeRecord = {};

    if (courseEntries.length === 0) {
      return gradeRecord;
    }

    courseEntries.forEach(([courseId, courseData]) => {
      gradeRecord[courseId] = gradeRecord[courseId] || {};

      if (!courseData.category) return;

      gradeRecord[courseId].categoryWeight = gradeRecord[courseId].categoryWeight || {};

      const categoryWeight = {};

      Object.entries(courseData.category).forEach(([catName, catValue]) => {
        categoryWeight[catName] = catValue.catWeight;
      });

      gradeRecord[courseId].categoryWeight = categoryWeight;

      gradeRecord[courseId].weightedScore = gradeRecord[courseId].weightedScore || {};

      courseData.classwork.forEach((work) => {
        const item = gradeRecord[courseId].weightedScore;

        if (!item[work.category]) {
          item[work.category] = [];
        }

        item[work.category].push(+work.weightedScore);
      });
    });

    return gradeRecord;
  },

  /**
   * Gets course grade averages.
   *
   * @param  {number}  studentId      The student identifier
   * @param  {object}  gradingPeriod  The Grading Period object
   * @param  {Number}  [..key]        Grading Period key for student grade level
   * @param  {Number}  [..id]         Get records for this Grading Period
   * @param  {String}  [..date]       Get records for this date within Grading Period
   * @param  {Boolean} [..isAll]      Need all records?
   *
   * @return {object}  The student grade averages per course.
   */
  getGradeAverage: (studentId, gradingPeriod = {}) => {
    const gradingPeriodRecord = classwork.getGradingPeriodRecords(studentId, gradingPeriod);

    if (!gradingPeriodRecord) {
      return {};
    }

    const courseEntries = Object.entries(gradingPeriodRecord);
    const gradeRecord = {};

    if (courseEntries.length === 0) {
      return gradeRecord;
    }

    courseEntries.forEach(([courseId, courseData]) => {
      gradeRecord[courseId] = gradeRecord[courseId] || {};

      const courseGrade = gradeRecord[courseId];

      courseGrade.courseName = courseData.name;

      if (courseData.classwork && courseData.classwork.length > 0) {
        const categoryWeight = {};
        const catTotal = {
          possible: 0,
          actual: 0
        };

        Object.entries(courseData.category).forEach(([catName, catValue]) => {
          categoryWeight[catName] = catValue.catWeight;
          catTotal.possible += catValue.catWeight;
          catTotal.actual += catValue.catWeight;
        });

        const weight = {
          score: {},
          total: {}
        };

        courseData.classwork.forEach((work) => {
          // Create new category where one doesn't exist.
          if (!weight.total[work.category]) {
            weight.total[work.category] = 0;
            weight.score[work.category] = 0;
            catTotal.actual -= categoryWeight[work.category];
          }
          // Add course total points and student score.
          weight.total[work.category] += +work.weightedTotalPoints;
          weight.score[work.category] += +work.weightedScore;
        });

        const courseAverage = Object.keys(weight.score).reduce((avg, catName) => {
          if (!catName) return avg;

          return avg + (categoryWeight[catName] * weight.score[catName]) / weight.total[catName];
        }, 0);

        // Adjust weight for different teacher scoring methods and for incomplete categories.
        // 1st part: (1 / possible) ## adjust total to add up to 100%
        // 2nd part: (possible / (possible - actual)) ## adjust for missing categories
        const weightAdjustment =
          ((1 / catTotal.possible) * catTotal.possible) / (catTotal.possible - catTotal.actual);

        courseGrade.average = (courseAverage * weightAdjustment * 100).toFixed(2);
        courseGrade.weightAdjustment = weightAdjustment;
        courseGrade.categoryWeight = courseGrade.categoryWeight || {};
        courseGrade.categoryWeight = categoryWeight;
        courseGrade.weightedScore = courseGrade.weightedScore || {};
        courseGrade.weightedScore = weight.score;
        courseGrade.weightedTotalPoints = courseGrade.weightedTotalPoints || {};
        courseGrade.weightedTotalPoints = weight.total;
      }
    });

    return gradeRecord;
  }
};

module.exports = grade;
