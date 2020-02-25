/**
 * Harvest the classwork data.
 *
 * @param  {object}  page    Puppeteer page context.
 *
 * @return {object}  The classwork.
 */
const getClasswork = async (page) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student';

  // 1) LOAD PAGE
  await page.goto(`${rootUrl}/Assignments.aspx`, { waitUntil: 'domcontentloaded' });

  // 2) "REFRESH VIEW" AFTER UPDATING:
  //    a) REPORT CARD RUN (to "all")
  await page.select('#plnMain_ddlReportCardRuns', 'ALL');
  //    b) ORDER BY (to show all assignments by "date" instead of by "class")
  await page.select('select#plnMain_ddlOrderBy', 'Date');

  await Promise.all([page.waitForNavigation(), page.click('#plnMain_btnRefreshView')]);

  // 3) GET DATA
  /**
   * Harvest student classwork and grades and output complete record.
   *
   * @return {Object}  The student record
   */
  const studentRecord = await page.evaluate(() => {
    const tableRowEls = document.querySelectorAll(
      '#plnMain_dgAssignmentsByDate .sg-asp-table-data-row'
    );
    const classworkData = [];

    tableRowEls.forEach((el) => {
      const tdEls = el.querySelectorAll('td');
      const scoreImgEl = tdEls[6].querySelector('img');

      classworkData.push({
        dateDue: tdEls[0].innerText,
        dateAssign: tdEls[1].innerText.trim(),
        course: tdEls[2].innerText,
        assignment: tdEls[3].innerText,
        category: tdEls[4].innerText,
        score: tdEls[6].innerText,
        comment: scoreImgEl ? scoreImgEl.title : ''
      });
    });

    return {
      timestamp: new Date().toJSON(),
      classwork: classworkData
    };
  });

  return studentRecord;
};

module.exports = getClasswork;
