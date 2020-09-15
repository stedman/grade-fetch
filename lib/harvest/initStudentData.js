/**
 * Initialize the student data.
 *
 * @param  {object}  page    Puppeteer page context.
 *
 * @return {object}  The student data.
 */
const initStudentData = async (page) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student';

  // 1) LOAD STUDENT PAGE
  await page.goto(`${rootUrl}/Registration.aspx`, { waitUntil: 'domcontentloaded' });

  // 2) GET DATA
  try {
    /**
     * Harvest student data output complete record.
     *
     * @return {Object}  The student record
     */
    const studentRecord = await page.evaluate(() => {
      // Just grab the 1st instance; the one that contains the student data.
      const contentEl = document.querySelector('.sg-content-grid');

      /**
       * Extract the inner text value from a DOM element.
       *
       * @param {string} selector The CSS selector.
       *
       * @return {string|object|undefined} Output based on available data.
       */
      const extractValue = (selector) => {
        const dataEl = contentEl.querySelector(selector);

        if (dataEl !== null) {
          const dataAnchorEl = dataEl.querySelector('a');

          if (dataAnchorEl) {
            const emailLink = dataAnchorEl.getAttribute('href');

            return {
              name: dataEl.innerText,
              // Strip the 'mailto:' prefix.
              email: emailLink.substring(7)
            };
          }

          return dataEl.innerText;
        }

        return undefined;
      };

      return {
        fullname: extractValue('#plnMain_lblRegStudentName'),
        grade: extractValue('#plnMain_lblGrade'),
        building: extractValue('#plnMain_lblBuildingName'),
        homeroom: {
          room: extractValue('#plnMain_lblHomeroom'),
          teacher: extractValue('#plnMain_lblHomeroomTeacher', true)
        },
        houseTeam: extractValue('#plnMain_lblHouseTeam'),
        counselor: extractValue('#plnMain_lblCounselor', true)
      };
    });

    return studentRecord;
  } catch (er) {
    throw new Error(er);
  }
};

module.exports = initStudentData;
