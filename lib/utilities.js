const periodData = require('../config/markingPeriods.json');

const utilities = {
  /**
   * Gets the school year.
   *
   * @param  {Date}     _date   The date object
   * @return {string}  The school year.
   */
  getSchoolYear: (_date) => {
    let date = _date;

    // Check if provided _date exists and is a Date object.
    if (!_date) {
      date = new Date();
    } else if (Object.prototype.toString.call(_date) !== '[object Date]') {
      date = new Date(_date);

      if (isNaN(date.getMonth())) {
        date = new Date();
      }
    }

    const month = date.getMonth();
    const year = date.getFullYear();

    return month >= 0 && month < 8 ? year.toString() : (year + 1).toString();
  },

  /**
   * Gets the run identifier for date.
   *
   * @param  {object||string}  targetDate  The target date (default is today)
   * @return {number}  The run identifier for date.
   */
  getMpForDate: (targetDate = new Date()) => {
    const schoolYear = utilities.getSchoolYear(targetDate);
    const markingPeriods = periodData[schoolYear];

    const mp = markingPeriods.findIndex((period) => {
      const start = new Date(period.start);
      const end = new Date(period.end);
      const target = new Date(targetDate);

      return target >= start && target <= end;
    });

    return {
      schoolYear: +schoolYear,
      markingPeriod: mp + 1
    };
  },

  /**
   * Gets the run date in milliseconds.
   *
   * @param  {number}  [mp]  The Marking Period
   * @return {object}  The run date in milliseconds.
   */
  getMpIntervals: (mp = utilities.getMpForDate()) => {
    /**
     * Convert Date to milliseconds.
     *
     * @param {Date||String} Date/time
     * @param {Number} Time in milliseconds
     */
    const convertToMs = (time) => new Date(time).getTime();

    const sy = utilities.getSchoolYear();
    const markingPeriod = typeof mp === 'object' ? mp.markingPeriod : mp;

    const interval = periodData[sy][markingPeriod - 1];

    if (!interval) {
      return {
        start: undefined,
        end: undefined,
        schoolYear: sy,
        markingPeriod
      };
    }

    return {
      start: convertToMs(interval.start),
      end: convertToMs(interval.end),
      schoolYear: sy,
      markingPeriod
    };
  }
};

module.exports = utilities;
