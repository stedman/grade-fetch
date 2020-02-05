const login = require('./login');

/**
 * Scrapes the student data.
 *
 * @param  {object}  page    Puppeteer page context.
 * @return {object}  The students.
 */
const getStudents = async (page) => {
  const gotoOptions = { waitUntil: 'domcontentloaded' };

  const studentUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Frame/StudentPicker';

  // Navigate to student selector.
  await page.goto(studentUrl, gotoOptions);

  // Login if redirected.
  if (page.url().indexOf('Account/LogOn') > -1) {
    await login(page);
  }

  // Wait until page loads.
  const parentSelector = '.sg-student-picker-row';
  await page.waitForSelector(parentSelector);

  /**
   *
   * Get student names and IDs from page.
   *
   * @param {object}  selector      The DOM selectors
   */
  const students = await page.evaluate((_parentSelector) => {
    const student = {};

    document.querySelectorAll(_parentSelector).forEach((el) => {
      const studentId = el.querySelector('#studentId').value;

      student[studentId] = {
        name: el.querySelector('.sg-picker-student-name').textContent,
        grade: el.querySelector('.sg-picker-grade').textContent.replace('Grade: ', '')
      };
    });

    return student;
  }, parentSelector);

  return students;
};

module.exports = getStudents;
