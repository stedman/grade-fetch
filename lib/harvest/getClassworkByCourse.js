/**
 * Harvests the classwork data.
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
  //    b) ORDER BY (leave as is: by "class")

  await Promise.all([page.waitForNavigation(), page.click('#plnMain_btnRefreshView')]);

  // 3) GET DATA FROM CLASSWORK PAGE

  /**
   * Harvest student classwork and grades and output complete record.
   *
   * @return {Object}  The student record
   */
  const studentRecord = await page.evaluate(() => {
    // Gather all the course groups.
    const courseEls = document.querySelectorAll('.AssignmentClass');
    const courseData = {};

    courseEls.forEach((courseEl) => {
      const courseName = courseEl.querySelector('.sg-header-heading').innerText;
      const courseId = courseName.substring(0, 9);

      // Set up course data object.
      courseData[courseId] = {
        name: courseName.substring(10)
      };

      // Gather the assignments for each course.
      const assignmentRowEls = courseEl.querySelectorAll(
        '.sg-asp-table:first-child .sg-asp-table-data-row'
      );
      const classworkData = [];

      assignmentRowEls.forEach((assignRowEl) => {
        const tdEls = assignRowEl.querySelectorAll('td');
        const scoreEl = tdEls[4];
        const scoreImgEl = scoreEl.querySelector('img');

        // Generate assignment data structure.
        classworkData.push({
          dateDue: tdEls[0].innerText,
          dateAssign: tdEls[1].innerText.trim(),
          assignment: tdEls[2].innerText,
          category: tdEls[3].innerText,
          score: scoreEl.innerText,
          weightedScore: tdEls[5].innerText,
          weightedTotalPoints: tdEls[6].innerText,
          comment: scoreImgEl ? scoreImgEl.title : ''
        });
      });

      courseData[courseId].classwork = classworkData;

      // Gather category scoring data.
      const categoryRowEls = courseEl.querySelectorAll(
        '.sg-asp-table:nth-child(2) .sg-asp-table-data-row'
      );
      const categoryData = {};

      categoryRowEls.forEach((catRowEl) => {
        const catItemEls = catRowEl.querySelectorAll('td');

        // Set the category key to cat name and category value to cat weight.
        categoryData[catItemEls[0].innerText] = Number(catItemEls[4].innerText);
      });

      courseData[courseId].category = categoryData;
    });

    return {
      crawlTime: new Date().toJSON(),
      courseData
    };
  });

  return studentRecord;
};

module.exports = getClasswork;
