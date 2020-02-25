const login = require('./login');

/**
 * Harvests the student data.
 *
 * @param  {object}  page       Puppeteer page context.
 *
 * @return {object}  students   One or more student records.
 */
const getStudents = async (page) => {
  const studentUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Frame/StudentPicker';

  // Navigate to student selector.
  await page.goto(studentUrl, { waitUntil: 'domcontentloaded' });

  // Log into site if redirected.
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
   *
   * @return {object}  student              The student data.
   * @return {object}  student.studentId    The student data.
   * @return {string}  student.studentId.name   The student name.
   * @return {string}  student.studentId.grade  The student grade level.
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
