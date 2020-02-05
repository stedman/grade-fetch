/**
 * Change student
 *
 * @param  {object}  page       Puppeteer page context.
 * @param  {string}  studentId  The student identifier
 */
const changeStudent = async (page, studentId) => {
  const studentUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Frame/StudentPicker';

  // Navigate to student selector.
  await page.goto(studentUrl, { waitUntil: 'domcontentloaded' });
  // Wait for form.
  const formSel = '#StudentPicker';
  await page.waitForSelector(formSel);
  // Click the appropriate student.
  await page.click(`#studentId[value="${studentId}"]`);
  // Submit form.
  await page.$eval(formSel, (form) => form.submit());
};

module.exports = changeStudent;
