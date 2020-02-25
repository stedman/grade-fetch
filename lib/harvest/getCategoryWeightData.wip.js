/**
 * Get category weight breakdown from assignments table.
 *
 * @param  {object}  page  Puppeteer context.
 *
 * @return {Array}   Category weight data.
 */
const getCategoryWeightData = async (page) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student';

  // Navigate to assignment page.
  await page.goto(`${rootUrl}/Assignments.aspx`, { waitUntil: 'domcontentloaded' });

  // Wait until page loads.
  const assignmentSel = '.AssignmentClass';
  await page.waitForSelector(assignmentSel);

  // Gather assignment tables.
  const courseEls = document.querySelectorAll(assignmentSel);
  const courseData = {};

  courseEls.forEach((courseEl) => {
    const courseName = courseEl.querySelector('.sg-header-heading').innerText;
    const courseId = courseName.substring(0, 9);

    // Set up course data object.
    courseData[courseId] = {
      name: courseName.substring(10)
    };

    const category = {};
    // (Yes, "LabelCatogery" is the way it is spelled in the source.)
    const categoryRowEls = courseEl.querySelectorAll('.LabelCatogery .sg-asp-table-data-row');

    categoryRowEls.forEach((catRowEl) => {
      const tdEls = catRowEl.querySelectorAll('td');

      // Set the category key to cat name and category value to cat weight.
      category[tdEls[0].innerText] = Number(tdEls[4].innerText);
    });

    // TODO: Add a means to check validity of category weights as there are varying implementations.
    // ... We would like to see floating point numbers that add up to exactly `1`.
    // ... We expect something such as `0.2 + 0.4 + 0.4` [correct].
    // ... I've seen `1 + 1` [incorrect: adds up to 2];
    // ... and `70 + 30` [incorrect: adds up to 100].
    // ... and `0.7 + 0.3 + 0.3` [incorrect: adds up to 1.3].
    // ... A possible gotcha here is that merely re-calculating the weights to add up to 1 may not
    // ... be the answer as it appears the `0.3` values in that last example are correct.
    // TODO: Also, it appears that categories do not show up until there is associated classwork.
    // ... A possible solution may be to go back one Marking Period to retrieve data but that may
    // ... introduce errors as some categories/weights are adjusted mid-term.
    courseData[courseId].category = category;
  });

  return courseData;
};

module.exports = getCategoryWeightData;
