const fs = require('fs');
const puppeteer = require('puppeteer');
const secrets = require('./secrets');

const site = {
  login: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn',
    sel: {
      username: '#LogOnDetails_UserName',
      password: '#LogOnDetails_Password',
      submit: '.sg-logon-button'
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
    }
  },
  cWork: {
    url: 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx',
    sel: {
      orderBy: 'select#plnMain_ddlOrderBy',
      refresh: '#plnMain_btnRefreshView',
      tableRows: '#plnMain_dgAssignmentsByDate tbody .sg-asp-table-data-row'
    }
  }
};

const scrape = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Skip loading un-needed visuals.
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // 1) LOGIN
  await page.goto(site.login.url, { waitUntil: 'networkidle2' });
  await page.waitForSelector(site.login.sel.username);
  await page.type(site.login.sel.username, secrets.username);
  await page.type(site.login.sel.password, secrets.password);
  await page.click(site.login.sel.submit);

  // 2) GET DATA FROM 1ST PAGE
  await page.waitForSelector(site.home.sel.table);

  let recordIdx = 0;

  /**
   * Scrape student data from home page.
   *
   * @type   {promise}
   */
  const studentRecords = await page.evaluate((selector) => {
    // TODO: Add ability to change students. Default is the 1st in alphabet.
    const student = document.querySelector(selector.studentName).innerText;
    const records = [];

    // Save the array index when we push new data into it.
    recordIdx = records.push({
      student,
      timestamp: (new Date()).toJSON(),
      currentAverage: []
    }) - 1;

    document.querySelectorAll(selector.tableRows)
      .forEach((el) => {
        records[recordIdx].currentAverage.push({
          class: el.querySelector(selector.courseName).innerText,
          grade: el.querySelector(selector.courseAverage).innerText
        });
      });

    return records;
  }, site.home.sel);

  // 3) LOAD SECOND PAGE
  await page.goto(site.cWork.url, { waitUntil: 'networkidle2' });

  // 4) REFRESH VIEW
  await page.select(site.cWork.sel.orderBy, 'Date');
  // TODO: Allow to change report card run. Default is the most current.

  await Promise.all([
    page.waitForNavigation(),
    page.click(site.cWork.sel.refresh)
  ]);

  // 5) GET DATA FROM 2ND PAGE

  /**
   * Add classwork records to student data.
   *
   * @type   {promise}
   */
  const classworkData = await page.evaluate((selector) => {
    const tableRows = document.querySelectorAll(selector.tableRows);
    const tableData = [];

    tableRows
      .forEach((el) => {
        const tds = el.querySelectorAll('td');

        tableData.push({
          date: tds[0].innerText,
          course: tds[2].innerText,
          category: tds[4].innerText,
          score: tds[6].innerText,
          assignment: tds[3].innerText
        });
      });

    return tableData;
  }, site.cWork.sel);

  await browser.close();

  studentRecords[recordIdx].classwork = classworkData;

  return studentRecords;
};

scrape()
  /**
   * Massage the data.
   * @param  {object} data  Student records.
   * @return {object}       Massaged student records.
   */
  .then((data) => {
    const studentRecord = data[data.length - 1];
    const classes = {
      '0731 - 14 Off Season': 'Off Season',
      '0776 - 12 Spanish I B': 'Spanish I B',
      '0827 - 17 Gateway 1': 'Gateway 1',
      '7720 - 38 Lang Arts 7 Tag': 'TAG Lang Arts 7',
      '7787 - 31 Tag Science 7': 'TAG Science 7',
      '7797 - 33 Tag Tx History': 'TAG TX History',
      '8750 - 29 Algebra I Tag': 'TAG Algebra I'
    };
    const majorCategories = [
      'Assessment',
      'Major Grades',
      'Performance',
      'Project',
      'Test'
    ];

    // Loop thru assignments and add new fields.
    const extendedClasswork = studentRecord.classwork.map((classRecord) => {
      const classTitle = classes[classRecord.course];
      // Category: a->assessment; d->daily
      const cat = majorCategories.includes(classRecord.category)
        ? 'a'
        : 'd';
      let { score } = classRecord;
      let note = '';

      if (classRecord.score === 'M') {
        score = 0;
        note = 'M';
      }

      return {
        date: classRecord.date,
        course: classRecord.course,
        class: classTitle,
        category: classRecord.category,
        cat,
        score,
        note,
        assignment: classRecord.assignment
      };
    });

    studentRecord.classwork = extendedClasswork;

    return data;
  })
  /**
   * Save the data.
   *
   * @param  {object}  data    The data.
   */
  .then((data) => {
    // Save the data.
    const dirname = './output';
    const filename = `${dirname}/grades-${Date.now()}.json`;

    // Create output directory if it doesn't already exist.
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname);
    }

    fs.writeFile(
      filename,
      JSON.stringify(data, null, 2),
      (err) => (
        err
          ? console.error('Data not written.', err)
          : console.log(`Data written to: ${filename}`)
      )
    );
  });
