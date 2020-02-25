/**
 * Get the student schedule data.
 *
 * @param  {object}  page    Puppeteer page context.
 *
 * @return {object}  The student data.
 */
const getScheduleData = async (page) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student';

  // 1) LOAD PAGE
  await page.goto(`${rootUrl}/Classes.aspx`, { waitUntil: 'domcontentloaded' });

  // TODO: check if page was redirected. If so, then schedule data will need to be harvested elsewhere.
  //       It's likely that this is an Elementary student and that there are 4 Marking Periods.

  // 2) GET DATA
  /**
   * Harvest schedule data.
   *
   * @return {Object}  Schedule data
   */
  const scheduleData = await page.evaluate(() => {
    const tableRowEls = document.querySelectorAll('.sg-asp-table-data-row');

    return tableRowEls.map((rowEl) => {
      const tdEls = rowEl.querySelectorAll('td');
      const teacherAEl = tdEls[3].querySelector('a');

      return {
        // TODO: check if we need to exclude courseIds starting with 00 -- example: 0070-33 is Advisory; 0091-73 is
        courseId: tdEls[0].innerText,
        courseName: tdEls[1].innerText,
        period: tdEls[2].innerText,
        teacher: {
          name: tdEls[3].innerText,
          email: teacherAEl ? teacherAEl.getAttribute('href').substring(7) : undefined
        },
        room: tdEls[4].innerText,
        markingPeriods: tdEls[6].innerText
          // strip the MP prefix
          .replace(/MP/g, '')
          // turn into array
          .split(', ')
          // convert from string to number
          .map((i) => +i)
      };
    });
  });

  return scheduleData;
};

module.exports = getScheduleData;
