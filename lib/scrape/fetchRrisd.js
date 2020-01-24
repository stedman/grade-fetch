const fs = require('fs');
const puppeteer = require('puppeteer');
const secrets = require('../../config/.secrets');
const site = require('../../config/rrisdSelectors.json');

const dataDir = './data';

// Make sure 'secrets' data is set up properly.
if (!(secrets && secrets.username && secrets.password && secrets.student)) {
  throw Error(
    'Missing config file. Please create /config/.secrets.js file based on /test/config/.secrets.js'
  );
}

/**
 * Scrape student grades from RRISD site.
 *
 * @return {Object}  Student grade record.
 */
const scrape = async () => {
  // 0) SET UP PUPPETEER
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

  // 1) LOGIN
  await page.goto(site.login.url, { waitUntil: 'networkidle2' });
  await page.waitForSelector(site.login.sel.username);
  await page.type(site.login.sel.username, secrets.username);
  await page.type(site.login.sel.password, secrets.password);
  await page.click(site.login.sel.submit);

  // 2) GET DATA FROM HOME PAGE
  await page.waitForSelector(site.home.sel.studentName);

  // TODO: Add ability to change students. Default is the 1st in alphabet.

  /**
   *
   * Get student name from page.
   *
   * @param {object}  selector      The DOM selectors
   */
  const studentName = await page.evaluate(
    (selector) => document.querySelector(selector.studentName).innerText,
    site.home.sel
  );

  /**
   * Get student ID by looking up student name from page.
   *
   * @param  {object}  student      The student name (key) and ID (value)
   * @param  {string}  studentName  The student name
   * @return {string}  Student ID
   */
  const studentId = await page.evaluate(
    (student, name) => student[name],
    secrets.student,
    studentName
  );

  // 3) LOAD CLASSWORK PAGE
  await page.goto(site.classWork.url, { waitUntil: 'networkidle2' });

  // 4) "REFRESH VIEW" AFTER UPDATING:
  //    a) REPORT CARD RUN (to "all")
  await page.select(site.classWork.sel.markingPeriod, 'ALL');
  //    b) ORDER BY (to show all assignments by "date" instead of by "class")
  await page.select(site.classWork.sel.orderBy, 'Date');

  await Promise.all([page.waitForNavigation(), page.click(site.classWork.sel.refresh)]);

  // 5) GET DATA FROM CLASSWORK PAGE

  /**
   * Scrape student classwork and grades and output complete record.
   *
   * @param  {object}  selector  The DOM selectors
   * @param  {String}  stdtId    The student identifier
   * @param  {String}  stdtName  The student name
   * @return {Object}  The student record
   */
  const studentRecord = await page.evaluate(
    (selector, stdtId, stdtName) => {
      const tableRows = document.querySelectorAll(selector.tableRows);
      const classworkData = [];

      tableRows.forEach((el) => {
        const tds = el.querySelectorAll('td');
        const scoreImg = tds[6].querySelector('img');

        classworkData.push({
          dateDue: tds[0].innerText,
          dateAssign: tds[1].innerText.trim(),
          course: tds[2].innerText,
          assignment: tds[3].innerText,
          category: tds[4].innerText,
          score: tds[6].innerText,
          comment: scoreImg ? scoreImg.title : ''
        });
      });

      // Build student data record and add classwork data.
      const record = {};

      record[stdtId] = {
        studentName: stdtName,
        timestamp: new Date().toJSON(),
        classwork: classworkData
      };

      return record;
    },
    site.classWork.sel,
    studentId,
    studentName
  );

  await browser.close();

  return studentRecord;
};

/**
 * Save the data to file.
 *
 * @param  {object}  data    The student data.
 */
const saveDataToFile = (data) => {
  // Save the data.
  const filename = `${dataDir}/classwork.json`;

  // Create output directory if it doesn't already exist.
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  fs.writeFile(filename, JSON.stringify(data, null, 2), (wrErr) => {
    if (wrErr) {
      throw Error(`Data not written.\n${wrErr}`);
    }

    // eslint-disable-next-line no-console
    console.log(`Data written to: ${filename}`);

    // Create archive copy of classwork file.
    const archiveDir = `${dataDir}/archive`;
    const archiveFile = `${archiveDir}/classwork-${Date.now()}.json`;

    // Create output directory if it doesn't already exist.
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }

    fs.copyFile(filename, archiveFile, (cpErr) =>
      cpErr
        ? // eslint-disable-next-line no-console
          console.error('Archive file not copied.', cpErr)
        : // eslint-disable-next-line no-console
          console.log(`Archive data copied to: ${archiveFile}.`)
    );
  });
};

/**
 * Run the scraper.
 */
scrape().then(saveDataToFile);
