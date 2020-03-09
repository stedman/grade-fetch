/**
 * Harvest the classwork data, grouped by course.
 *
 * @param  {object}  page      Puppeteer page context.
 * @param  {boolean} isLatest  Just get the latest (default) grading period.
 *
 * @return {object}  The classwork.
 */
const getGrades = async (page, isLatest) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student';

  // 1) LOAD PAGE
  await page.goto(`${rootUrl}/Assignments.aspx`, { waitUntil: 'domcontentloaded' });

  // 2) "REFRESH VIEW" AFTER UPDATING:
  //    a) REPORT CARD RUN (to "all")
  if (!isLatest) {
    await page.select('#plnMain_ddlReportCardRuns', 'ALL');
    await Promise.all([page.waitForNavigation(), page.click('#plnMain_btnRefreshView')]);
  }

  // 3) GET DATA
  /**
   * Harvest student classwork and grades and output complete record.
   *
   * @return {Object}  The student record
   */
  const studentRecord = await page.evaluate(() => {
    /**
     * Helper function to cleanup DOM to text.
     *
     * @param {node}    element   DOM element
     * @param {boolean} [number]  Coerce to Number?
     */
    const extractText = (element, number) => {
      let text = '';

      if (element !== undefined) {
        text = element.innerText.trim();

        if (number && text !== '') {
          text = +text;
        }
      }

      return text;
    };

    // Gather all the course groups.
    const courseEls = document.querySelectorAll('.AssignmentClass');
    const courseData = {};

    courseEls.forEach((courseEl) => {
      const courseFullName = courseEl.querySelector('.sg-header-heading').innerText;
      const courseId = courseFullName.substring(0, 9).trim();
      const courseName = courseFullName.substring(9).trim();

      // Set up course data object.
      courseData[courseId] = {
        name: courseName
      };

      const courseTableEls = courseEl.querySelectorAll('.sg-asp-table');

      if (courseTableEls.length) {
        // Gather category totals.
        const catTotalTdEls = courseTableEls[1].querySelectorAll('tr:last-child td');

        courseData[courseId].categoryTotal = {
          weight: extractText(catTotalTdEls[4], true),
          points: extractText(catTotalTdEls[5], true)
        };

        // Gather category scoring data.
        const categoryRowEls = courseTableEls[1].querySelectorAll('.sg-asp-table-data-row');
        const categoryData = {};

        categoryRowEls.forEach((catRowEl) => {
          const tdEls = catRowEl.querySelectorAll('td');

          // Set the category key to cat name and category value to cat weight.
          categoryData[extractText(tdEls[0])] = {
            studentPoints: extractText(tdEls[1], true),
            maxPoints: extractText(tdEls[2], true),
            percent: +extractText(tdEls[3]).replace('%', ''),
            catWeight: extractText(tdEls[4], true),
            catPoints: extractText(tdEls[5], true)
          };
        });

        courseData[courseId].category = categoryData;

        // Gather the assignments for each course.
        const assignmentRowEls = courseTableEls[0].querySelectorAll('.sg-asp-table-data-row');
        const classworkData = [];

        assignmentRowEls.forEach((assignRowEl) => {
          const tdEls = assignRowEl.querySelectorAll('td');
          const scoreEl = tdEls[4];
          const scoreImgEl = scoreEl.querySelector('img');

          // Generate assignment data structure.
          // TODO: Remove unused data points.
          classworkData.push({
            dateDue: extractText(tdEls[0]),
            dateAssigned: extractText(tdEls[1]),
            assignment: extractText(tdEls[2]),
            category: extractText(tdEls[3]),
            // score can be empty string or "M"
            score: extractText(scoreEl),
            totalPoints: extractText(tdEls[5], true),
            weight: extractText(tdEls[6], true),
            // weightedScore can be single-space string (" ")
            weightedScore: extractText(tdEls[7]),
            weightedTotalPoints: extractText(tdEls[8], true),
            comment: scoreImgEl ? scoreImgEl.title : ''
          });
        });

        courseData[courseId].classwork = classworkData;
      }
    });

    return {
      crawled: new Date().toJSON(),
      course: courseData
    };
  });

  return studentRecord;
};

module.exports = getGrades;
