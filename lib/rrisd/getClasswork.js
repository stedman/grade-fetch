/**
 * Scrapes the classwork data.
 *
 * @param  {object}  page    Puppeteer page context.
 * @return {object}  The classwork.
 */
const getClasswork = async (page) => {
  const classworkUrl =
    'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx';

  // 1) LOAD CLASSWORK PAGE
  await page.goto(classworkUrl, { waitUntil: 'domcontentloaded' });

  // 2) "REFRESH VIEW" AFTER UPDATING:
  //    a) REPORT CARD RUN (to "all")
  await page.select('#plnMain_ddlReportCardRuns', 'ALL');
  //    b) ORDER BY (to show all assignments by "date" instead of by "class")
  await page.select('select#plnMain_ddlOrderBy', 'Date');

  await Promise.all([page.waitForNavigation(), page.click('#plnMain_btnRefreshView')]);

  // 3) GET DATA FROM CLASSWORK PAGE

  /**
   * Scrape student classwork and grades and output complete record.
   *
   * @return {Object}  The student record
   */
  const studentRecord = await page.evaluate(() => {
    const tableRows = document.querySelectorAll(
      '#plnMain_dgAssignmentsByDate .sg-asp-table-data-row'
    );
    const classworkData = [];

    tableRows.forEach((el) => {
      const tds = el.querySelectorAll('td');
      const scoreImg = tds[6].querySelector('img');

      classworkData.push({
        dateDue: tds[0].innerText,
        dateAssign: tds[1].innerText.trim(),
        course: tds[2].innerText,
        assignment: tds[3].innerText,
        category: tds[4].innerText,
        score: tds[6].innerText,
        comment: scoreImg ? scoreImg.title : ''
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
