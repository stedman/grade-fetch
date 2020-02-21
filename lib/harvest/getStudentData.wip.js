/**
 * Harvests the student data.
 *
 * @param  {object}  page    Puppeteer page context.
 * @return {object}  The student data.
 */
const getStudentData = async (page) => {
  const registrationUrl =
    'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Registration.aspx';

  // 1) LOAD STUDENT PAGE
  await page.goto(registrationUrl, { waitUntil: 'domcontentloaded' });

  // 2) GET DATA
  /**
   * Harvest student data output complete record.
   *
   * @return {Object}  The student record
   */
  const studentRecord = await page.evaluate(() => {
    const wrapperEl = document.querySelector('.sg-content-grid');

    /**
     * Extract the inner text value from a DOM element.
     *
     * @param {string} selector The CSS selector.
     * @param {boolean} email   Optional email parsing.
     *
     * @return {string|object|undefined} Output based on available data.
     */
    const extractValue = (selector, email) => {
      const el = wrapperEl.querySelector(selector);

      if (el) {
        if (email) {
          const aEl = el.querySelector('a');

          return {
            name: aEl.innerText,
            // Get the href attribute and strip the 'mailto:' prefix.
            email: aEl ? aEl.getAttribute('href').substring(7) : undefined
          };
        }

        return el.innerText;
      }

      return undefined;
    };

    const studentId = wrapperEl.querySelector('#plnMain_lblRegStudentID').innerText;

    return {
      [studentId]: {
        fullname: extractValue('#plnMain_lblRegStudentName'),
        grade: extractValue('#plnMain_lblGrade'),
        building: extractValue('#plnMain_lblBuildingName'),
        homeroom: {
          room: extractValue('#plnMain_lblHomeroom'),
          teacher: extractValue('#plnMain_lblHomeroomTeacher', true)
        },
        houseTeam: extractValue('#plnMain_lblHouseTeam'),
        counselor: extractValue('#plnMain_lblCounselor', true)
      }
    };
  });

  return studentRecord;
};

module.exports = getStudentData;
