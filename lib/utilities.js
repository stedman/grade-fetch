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
   * @param  {object||string}  [targetDate=new Date()]  The target date
   * @return {number}  The run identifier for date.
   */
  getRunIdForDate: (targetDate = new Date()) => {
    return intervalData.findIndex((runEnd, idx) => {
      const prevRunEnd = intervalData[idx - 1];

      if (prevRunEnd === undefined) return false;

      const start = new Date(prevRunEnd);
      const end = new Date(runEnd);
      const target = new Date(targetDate);

      return target > start && target < end;
    });
  },

  /**
   * Gets the run date in milliseconds.
   *
   * @param  {number}  [runId]  The run identifier
   * @return {object}  The run date in milliseconds.
   */
  getRunDateInMs: (runId = utilities.getRunIdForDate()) => {
    const prevRunEnd = intervalData[runId - 1];

    if (prevRunEnd === undefined) return false;

    const convertToMs = (time) => new Date(time).getTime();

    return {
      start: convertToMs(prevRunEnd),
      end: convertToMs(intervalData[runId])
    };
  }
};

module.exports = utilities;
