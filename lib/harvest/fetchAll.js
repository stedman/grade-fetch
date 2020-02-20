const puppeteer = require('puppeteer');
const utilities = require('../../lib/utilities');
const getStudents = require('./getStudents');
const changeStudent = require('./changeStudent');
const getClasswork = require('./getClasswork');
const saveDataToFile = require('./saveDataToFile');

const dataDir = './data';

/**
 * Harvest student classwork.
 *
 * @return {Object}  Student grade record.
 */
const harvest = async () => {
  // 0) SET UP PUPPETEER
  // TODO: May want to change this to 'tmp' directory. Also, test for dir instead of var.
  if (!dataDir) throw Error('dataDir missing');

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

  // 2) FETCH CLASSWORK / ASSIGNMENTS
  const studentKeys = Object.keys(studentDict);
  const studentRecord = {};

  // Get classwork records for each student.
  for (let idx = 0; idx < studentKeys.length; idx += 1) {
    const studentId = studentKeys[idx];

    // a) Change student session
    if (idx !== 0) {
      // eslint-disable-next-line no-await-in-loop
      await changeStudent(page, studentId);
    }
    // b) Get classwork
    studentRecord[studentId] = {
      // Group current year's classwork.
      // eslint-disable-next-line no-await-in-loop
      [utilities.getSchoolYear()]: await getClasswork(page)
    };
  }

  await browser.close();

  return studentRecord;
};

/**
 * Run the harvester.
 */
harvest().then((data) => {
  return saveDataToFile(data, dataDir);
});
