const puppeteer = require('puppeteer');
const changeStudent = require('./changeStudent');
const login = require('./login');
const getGrades = require('./getGrades');
const saveDataToFile = require('./saveDataToFile');

const studentModel = require('../../models/student');

const dataFile = {
  // TODO: May want to change 'data' to 'tmp' directory.
  dir: './data',
  grades: 'grades.json'
};

let wantLatest;

if (process.argv[2] === 'latest') {
  dataFile.grades = 'grades-latest.json';
  wantLatest = true;

  // eslint-disable-next-line no-console
  console.info('Collecting student classwork from the latest Grading Period.');
}

/**
 * Harvest student grades.
 *
 * @return {Object}  Student's current school record (promise).
 */
const harvest = async () => {
  // 0) GET STUDENT RECORDS
  const studentRecords = studentModel.getAllStudentRecords();

  if (!studentRecords) {
    // eslint-disable-next-line no-console
    console.warn('No data. Please run "fetchAll".');

    return {};
  }

  const studentKeys = Object.keys(studentRecords);

  // 0) SET UP PUPPETEER
  // Cache browser assets to speed up reloads (saves 1+ second).
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: `${dataFile.dir}/puppeteer`
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

  // 1) LOGIN TO SITE
  const studentUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Frame/StudentPicker';

  // Navigate to student selector page (because it doesn't take long to load).
  await page.goto(studentUrl, { waitUntil: 'domcontentloaded' });

  // Log into site if redirected.
  if (page.url().indexOf('Account/LogOn') > -1) {
    await login(page);
  }

  // Wait until page loads.
  await page.waitForSelector('.sg-student-picker-row');

  // 2) LOOP OVER EACH STUDENT
  const classworkRecord = {};
  /* eslint-disable no-await-in-loop */
  for (let idx = 0; idx < studentKeys.length; idx += 1) {
    const studentId = studentKeys[idx];

    // 3) CHANGE STUDENT SESSION (for each student after 1st round)
    if (idx !== 0) {
      await changeStudent(page, studentId);
    }

    // 4) GET CLASSWORK -- ALL or JUST THE LATEST
    classworkRecord[studentId] = await getGrades(page, wantLatest);
  }
  /* eslint-enable no-await-in-loop */

  await browser.close();

  return {
    classwork: classworkRecord
  };
};

// 5) (RUN HARVESTER and then) SAVE DATA
harvest().then((data) => {
  saveDataToFile(data.classwork, dataFile.dir, dataFile.grades);
});
