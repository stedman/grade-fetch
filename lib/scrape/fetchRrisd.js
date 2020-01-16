const fs = require('fs');
const puppeteer = require('puppeteer');
const secrets = require('../../config/.secrets');

// Make sure 'secrets' data is set up properly.
if (!(secrets && secrets.username && secrets.password && secrets.student)) {
  throw Error('Missing config file. Please create /config/.secrets.js file based on /test/config/.secrets.js');
}

// TODO: Move DOM selectors to separate config file?
const site = {
  login: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn',
    sel: {
      username: '#LogOnDetails_UserName',
      password: '#LogOnDetails_Password',
      submit: '.sg-logon-button'
    }
  },
  changeStudent: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn',
    sel: {
      studentName: '.sg-banner-chooser .sg-banner-text',
      changeBtn: '.sg-add-change-student'
    },
    popup: {
      sel: {
        parentEl: '.sg-student-picker-row',
        studentId: '#studentId', // ID is in the value attr
        studentName: 'sg-picker-student-name',
        studentBldg: '.sg-picker-building',
        studentGrade: '.sg-picker-grade',
        submitBtn: '.sg-cancel-submit-picker:first-of-type'
      }
    }
  },
  home: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Home/WeekView',
    sel: {
      studentName: '.sg-banner-chooser .sg-banner-text',
      table: '.sg-homeview-table',
      tableRows: '.sg-homeview-table tbody tr',
      courseName: '#courseName',
      courseAverage: '#average'
    },
    table: {
      sel: '.sg-homeview-table',
      rowSel: 'tbody tr',
      cols: []
    }
  },
  schedule: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Classes.aspx',
    table: {
      sel: '.sg-asp-table',
      rowSel: '.sg-asp-table-data-row',
      cols: ['course', 'name', 'period', 'teacher', 'room', 'days', 'markingPeriods', 'building', 'status']
    }
  },
  classWork: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx',
    sel: {
      fullViewBtn: '#plnMain_spnView .sg-button',
      orderBy: 'select#plnMain_ddlOrderBy', // values: Class [default] or Date
      refresh: '#plnMain_btnRefreshView',
      tableRows: '#plnMain_dgAssignmentsByDate .sg-asp-table-data-row'
    },
    table: {
      sel: '.sg-asp-table',
      rowSel: '.sg-asp-table-data-row',
      cols: ['dueDate', 'dateAssign', 'course', 'assignment', 'category', 'points', 'score']
    }
  },
  scoring: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx',
    sel: {
      parentEl: '.AssignmentClass',
      courseName: 'a.sg-header-heading',
      table: {
        sel: '.sg-asp-table-group',
        rowSel: '.sg-asp-table-data-row',
        cols: ['category', 'studentPoints', 'maxPoints', 'percent', 'weight', 'points']
      }
    }
  }
};

// TODO: Break up this monsterous `scrape()` promise.

/**
 * Scrape student grades from RRISD site.
 *
 * @return {Object}  Student grade record.
 */
const scrape = async () => {
  // 0) SET UP PUPPETEER

  // Cache browser assets to speed up reloads (saves 1+ second).
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: '../../data/puppeteer'
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
  await page.waitForSelector(site.home.sel.table);

  // TODO: Add ability to change students. Default is the 1st in alphabet.

  /**
   *
   * Get student name from page.
   *
   * @param {object}  selector      The DOM selectors
   */
  const studentName = await page.evaluate((selector) => document.querySelector(selector.studentName).innerText, site.home.sel);

  /**
   * Get student ID by looking up student name from page.
   *
   * @param  {object}  student      The student name (key) and ID (value)
   * @param  {string}  studentName  The student name
   * @return {string}  Student ID
   */
  const studentId = await page.evaluate((student, name) => student[name], secrets.student, studentName);

  // 3) LOAD CLASSWORK PAGE
  await page.goto(site.classWork.url, { waitUntil: 'networkidle2' });

  // 4) "REFRESH VIEW" TO SHOW ALL ASSIGNMENTS BY DATE (instead of by "class")
  await page.select(site.classWork.sel.orderBy, 'Date');

  // TODO: Allow to change report card run. Default is the most current.

  await Promise.all([
    page.waitForNavigation(),
    page.click(site.classWork.sel.refresh)
  ]);

  // 5) GET DATA FROM CLASSWORK PAGE

  /**
   * Scrape student classwork and grades.
   *
   * @param {object}  selector      The DOM selectors
   */
  const classworkData = await page.evaluate((selector) => {
    const tableRows = document.querySelectorAll(selector.tableRows);
    const tableData = [];

    tableRows
      .forEach((el) => {
        const tds = el.querySelectorAll('td');
        const scoreImg = tds[6].querySelector('img');

        tableData.push({
          dateDue: tds[0].innerText,
          dateAssign: tds[1].innerText.trim(),
          course: tds[2].innerText,
          assignment: tds[3].innerText,
          category: tds[4].innerText,
          score: tds[6].innerText,
          comment: scoreImg ? scoreImg.title : ''
        });
      });

    return tableData;
  }, site.classWork.sel);

  /**
   * Build student data record with classwork data.
   *
   * @param  {String}  stdtId    The student identifier
   * @param  {String}  stdtName  The student name
   * @param  {Object}  cwData    The classwork data
   * @return {Object}  The ongoing student record
   */
  const studentRecord = await page.evaluate((stdtId, stdtName, cwData) => {
    const record = {};

    record[stdtId] = {
      studentName: stdtName,
      timestamp: (new Date()).toJSON(),
      classwork: cwData
    };

    return record;
  }, studentId, studentName, classworkData);

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
  const dirname = '../../data';
  const filename = `${dirname}/grades.json`;

  // Create output directory if it doesn't already exist.
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }

  fs.writeFile(
    filename,
    JSON.stringify(data, null, 2),
    (wrErr) => {
      if (wrErr) {
        throw Error(`Data not written.\n${wrErr}`);
      }

      // eslint-disable-next-line no-console
      console.log(`Data written to: ${filename}`);

      // Create archive copy of grades file.
      const archiveDir = `${dirname}/archive`;
      const archiveFile = `${archiveDir}/grades-${Date.now()}.json`;

      // Create output directory if it doesn't already exist.
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir);
      }

      fs.copyFile(
        filename,
        archiveFile,
        (cpErr) => (
          cpErr
            // eslint-disable-next-line no-console
            ? console.error('Archive file not copied.', cpErr)
            // eslint-disable-next-line no-console
            : console.log(`Archive data copied to: ${archiveFile}.`)
        )
      );
    }
  );
};

/**
 * Run the scraper.
 */
scrape()
  .then(saveDataToFile);
