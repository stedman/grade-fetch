const periodData = require('../config/gradingPeriods.json');

/**
 * Convert Date to milliseconds.
 *
 * @param   {(Date|string)} time
 *
 * @return  {Number} Time in milliseconds
 */
const convertToMs = (time) => new Date(time).getTime();

const period = {
  // Grading Period keys.
  periodKeys: ['sixWeek', 'nineWeek'],

  /**
   * Gets the school year.
   *
   * @param  {(Date|string)} dateToCheck   The date to check.
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
      return period.periodKeys[0];
    }

    return period.periodKeys[1];
  },

  /**
   * Gets the grading periods from period key.
   *
   * @param  {string}  [periodKey]  The period key
   *
   * @return {array}  The grading periods.
   */
  getGradingPeriodsFromPeriodKey: (periodKey) => {
    const rePeriodKey = new RegExp(`^(${period.periodKeys.join('|')})$`);

    // Assume the default Grading Period should be for post-elementary (where grades count more).
    return rePeriodKey.test(periodKey) ? periodData[periodKey] : periodData[period.periodKeys[0]];
  },

  /**
   * Gets the grade period for a specific date.
   *
   * @param  {object}  gradingPeriod  The Grading Period object
   * @param  {Number}  [..key]        Grading Period key for student grade level
   * @param  {Number}  [..id]         Get records for this Grading Period
   * @param  {String}  [..date]       Get records for this date within Grading Period
   * @param  {Boolean} [..isAll]      Need all records?
   *
   * @return {number}  The run identifier for date.
   */
  getGradingPeriodIndex: (gradingPeriod) => {
    const { key: periodKey, id: periodIndex, date: periodDate, isAll } = gradingPeriod;

    if (isAll) {
      return 0;
    }
    if (periodIndex !== undefined) {
      return periodIndex;
    }

    const gradingPeriods = period.getGradingPeriodsFromPeriodKey(periodKey);
    const reRunDate = /^\d{1,2}[-/]\d{1,2}[-/]20\d{2}$/;
    const targetDate = reRunDate.test(periodDate) ? new Date(periodDate) : new Date();

    const index = gradingPeriods.findIndex((interval) => {
      const startDate = new Date(interval.start);
      const endDate = new Date(interval.end);

      return targetDate >= startDate && targetDate <= endDate;
    });

    return index + 1;
  },

  /**
   * Gets the run date in milliseconds.
   *
   * @param  {object}  gradingPeriod  The Grading Period object
   * @param  {Number}  [..key]        Grading Period key for student grade level
   * @param  {Number}  [..id]         Get records for this Grading Period
   * @param  {String}  [..date]       Get records for this date within Grading Period
   * @param  {Boolean} [..isAll]      Need all records?
   *
   * @return {object}  The run date in milliseconds.
   */
  getGradingPeriodInterval: (gradingPeriod) => {
    const { key: periodKey, id: periodIndex, isAll } = gradingPeriod;
    const gradingPeriodData = period.getGradingPeriodsFromPeriodKey(periodKey);
    const gpLength = gradingPeriodData.length;
    const rePeriodIndex = /^[1-6]$/;

    // Initial interval is entire school year.
    let index = 0;

    // If we don't ask for all year, then get Grading Period.
    if (!isAll) {
      // If no Grading Period provided, use current.
      index = !rePeriodIndex.test(periodIndex)
        ? period.getGradingPeriodIndex(gradingPeriod)
        : +periodIndex;
    }

    // Get the time intervals for the period.
    const interval = gradingPeriodData[index - 1];

    if (!interval) {
      // If no Grading Period, then return first and last date of school year.
      return {
        start: convertToMs(gradingPeriodData[0].start),
        end: convertToMs(gradingPeriodData[gradingPeriodData.length - 1].end),
        gradingPeriod: {
          first: 1,
          current: index,
          last: gpLength
        }
      };
    }

    const prev = index <= 1 ? undefined : index - 1;
    const next = index >= gpLength ? undefined : index + 1;

    return {
      start: convertToMs(interval.start),
      end: convertToMs(interval.end),
      gradingPeriod: {
        first: 1,
        prev,
        current: index,
        next,
        last: gpLength
      }
    };
  }
};

module.exports = period;
