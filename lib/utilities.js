const intervalData = require('../data/intervals.json');

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
    return intervalData.findIndex((runEndDate, idx) => {
      const prevRunEndDate = intervalData[idx - 1];

      if (prevRunEndDate === undefined) return false;

      const start = new Date(prevRunEndDate);
      const end = new Date(runEndDate);
      const target = new Date(targetDate);

      return target > start && target < end;
    });
  },

  /**
   * Gets the run date in milliseconds.
   *
   * @param  {number}  [mp]  The Marking Period
   * @return {object}  The run date in milliseconds.
   */
  getMpDateInMs: (mp = utilities.getMpForDate()) => {
    const prevRunEndDate = intervalData[mp - 1];

    if (prevRunEndDate === undefined) return false;

    const convertToMs = (time) => new Date(time).getTime();

    return {
      start: convertToMs(prevRunEndDate),
      end: convertToMs(intervalData[mp])
    };
  }
};

module.exports = utilities;
