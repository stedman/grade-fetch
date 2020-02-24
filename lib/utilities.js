const periodData = require('../config/gradingPeriods.json');

const utilities = {
  // Grading Period keys.
  periodKeys: ['sixWeek', 'nineWeek'],

  /**
   * Gets the school year.
   *
   * @param  {Date|string} dateToCheck   The date to check.
   *
   * @return {string}  The school year.
   */
  getSchoolYear: (dateToCheck) => {
    // Assume dateToCheck is Date object.
    let date = dateToCheck;

    // Check if dateToCheck exists.
    if (!dateToCheck) {
      date = new Date();
      // Check if dateToCheck is not a Date object.
    } else if (Object.prototype.toString.call(dateToCheck) !== '[object Date]') {
      date = new Date(dateToCheck);

      if (isNaN(date.getMonth())) {
        date = new Date();
      }
    }

    const month = date.getMonth();
    const year = date.getFullYear();

    // In this case, the 'school year' is the year of 'graduation', so add 1 to autumn year.
    return month >= 0 && month < 8 ? year.toString() : (year + 1).toString();
  },

  /**
   * Get the Grading Period key for grade level.
   *
   * @param  {number}  [grade]   Student's grade level.
   *
   * @return {string}  The grading period span.
   */
  getGradingPeriodKey: (grade) => {
    // Assume the default Grading Period should be for post-elementary (where grades count more).
    if (grade === undefined || grade > 5) {
      return utilities.periodKeys[0];
    }

    return utilities.periodKeys[1];
  },

  /**
   * Get current grading periods for specific grade level.
   *
   * @param   {number}  [grade]    Student's grade level.
   *
   * @return  {array}   Current school year's grading periods.
   */
  getGradingPeriodsFromGradeLevel: (grade) => {
    return periodData[utilities.getGradingPeriodKey(grade)];
  },

  /**
   * Gets the grading periods from period key.
   *
   * @param  {string}  periodKey  The period key
   *
   * @return {array}  The grading periods.
   */
  getGradingPeriodsFromPeriodKey: (periodKey) => {
    const rePeriodKey = /^(sixWeek|nineWeek)$/;

    // Assume the default Grading Period should be for post-elementary (where grades count more).
    return rePeriodKey.test(periodKey)
      ? periodData[periodKey]
      : periodData[utilities.periodKeys[0]];
  },

  /**
   * Gets the grade period for a specific date.
   *
   * @param  {object||string}  [date]       The target date (default is today)
   * @param  {number}          [periodKey]  The Grading Period key
   *
   * @return {number}  The run identifier for date.
   */
  getGradingPeriodIndex: (date, periodKey) => {
    const gradingPeriods = utilities.getGradingPeriodsFromPeriodKey(periodKey);
    const targetDate = date === undefined ? new Date() : new Date(date);

    const periodIndex = gradingPeriods.findIndex((period) => {
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);

      return targetDate >= startDate && targetDate <= endDate;
    });

    return periodIndex + 1;
  },

  /**
   * Gets the run date in milliseconds.
   *
   * @param  {number}  [periodIndex]  The Grading Period index
   * @param  {number}  [periodKey]    The Grading Period key
   *
   * @return {object}  The run date in milliseconds.
   */
  getGradingPeriodTime: (periodIndex, periodKey) => {
    /**
     * Convert Date to milliseconds.
     *
     * @param {Date||String} Date/time
     * @param {Number} Time in milliseconds
     */
    const convertToMs = (time) => new Date(time).getTime();

    const gradingPeriods = utilities.getGradingPeriodsFromPeriodKey(periodKey);
    const gpLength = gradingPeriods.length;
    const rePeriodIndex = /^[1-6]$/;
    // If no period provided, use current.
    const verifiedPeriodIndex =
      periodIndex === undefined || !rePeriodIndex.test(periodIndex)
        ? utilities.getGradingPeriodIndex(new Date(), periodKey)
        : periodIndex;
    const gradingPeriod = {
      first: 1,
      prev: verifiedPeriodIndex <= 1 ? null : verifiedPeriodIndex - 1,
      current: verifiedPeriodIndex,
      next: verifiedPeriodIndex >= gpLength ? null : verifiedPeriodIndex + 1,
      last: gpLength
    };
    // Get the time intervals for the period.
    const interval = gradingPeriods[verifiedPeriodIndex - 1];

    if (!interval) {
      return {
        start: undefined,
        end: undefined,
        gradingPeriod
      };
    }

    return {
      start: convertToMs(interval.start),
      end: convertToMs(interval.end),
      gradingPeriod
    };
  }
};

module.exports = utilities;
