const puppeteer = require('puppeteer');
const getStudents = require('./getStudents');
const changeStudent = require('./changeStudent');
const getGrades = require('./getGrades.wip');
const saveDataToFile = require('./saveDataToFile');

// TODO: May want to change 'data' to 'tmp' directory.
const dataDir = './data';

/**
 * Harvest student grades.
 *
 * @return {Object}  Student's current school record (promise).
 */
const harvest = async () => {
  // 0) SET UP PUPPETEER

  // Cache browser assets to speed up reloads (saves 1+ second).
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: `${dataDir}/puppeteer`
  });
  const page = await browser.newPage();

  // Load only required docs and scripts to navigate.
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['document', 'script'].includes(req.resourceType())) {
      req.continue();
    } else {
      req.abort();
    }
  });

  // 1) FETCH STUDENT META DATA
  const studentDict = await getStudents(page);
  const studentKeys = Object.keys(studentDict);
  const studentRecord = {};

  // 2) FETCH GRADES FOR EACH STUDENT
  for (let idx = 0; idx < studentKeys.length; idx += 1) {
    const studentId = studentKeys[idx];

    /* eslint-disable no-await-in-loop */
    if (idx !== 0) {
      // a) Change student session
      await changeStudent(page, studentId);
    }

    // b) Get classwork results
    studentRecord[studentId] = await getGrades(page);
  }
  /* eslint-enable no-await-in-loop */

  await browser.close();

  return studentRecord;
};

// 3) RUN HARVEST AND SAVE DATA
harvest().then((data) => {
  return saveDataToFile(data, dataDir, 'grades.json');
});
