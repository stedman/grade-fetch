/**
 * Get course date from table.
 *
 * @param  {object}  page  Puppeteer context.
 * @return {Array}   Class scoring data.
 */
const getCourseData = async (page) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org//HomeAccess/Content/Student';
  const gotoOptions = { waitUntil: 'domcontentloaded' };

  const reportCardUrl = `${rootUrl}/ReportCards.aspx`;

  // Navigate to report card page.
  await page.goto(reportCardUrl, gotoOptions);

  // Wait until page loads.
  const coursesSel = '.sg-asp-table-data-row';
  await page.waitForSelector(coursesSel);

  // Gather course data rows.
  const courseEls = document.querySelectorAll(coursesSel);
  const courseData = {};

  courseEls.forEach((courseEl) => {
    // Gather course data cells.
    const tdEls = courseEl.querySelectorAll('td');
    const courseId = tdEls[0].innerText.trim();
    // ASP "section key" for extracting Marking Period data from popup.
    const sectionKey = tdEls[1].children[0].getAttribute('onclick').substring(16, 23);

    courseData[courseId] = {
      name: tdEls[1].innerText,
      period: tdEls[2].innerText,
      teacher: {
        name: tdEls[3].innerText,
        email: tdEls[3].children[0].href.substring(7)
      },
      room: tdEls[4].innerText,
      key: sectionKey
    };

    return courseData;
  });

  const courseDataKeys = Object.keys(courseData);

  for (let idx = 0; idx < courseDataKeys.length; idx += 1) {
    const course = courseData[courseDataKeys[idx]];
    const popupUrl = `${rootUrl}/ClassPopUp.aspx?section_key=${course.key}`;

    // Navigate to popup.
    // eslint-disable-next-line no-await-in-loop
    await page.goto(popupUrl, gotoOptions);

    // Wait until page loads.
    const popupSel = '.sg-asp-table-data-row';
    // eslint-disable-next-line no-await-in-loop
    await page.waitForSelector(popupSel);

    // Gather popup data rows.
    const popupEls = document.querySelectorAll(popupSel);

    popupEls.forEach((row) => {
      // Get Marking Period text from 5th table cell.
      const mpText = row.querySelector('td:nth-child(5)').innerText;

      if (mpText === undefined || !mpText.length) {
        return;
      }

      course.markingPeriods = mpText.split(', ').map((mp) => {
        return Number(mp.substring(2));
      });
    });
  }

  return courseData;
};

module.exports = getCourseData;
