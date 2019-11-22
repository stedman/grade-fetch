const fs = require('fs');
const puppeteer = require('puppeteer');
const secrets = require('./secrets');

const scrape = async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
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
  await page.goto('https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn',
    { waitUntil: 'networkidle2' });
  await page.waitForSelector('#LogOnDetails_UserName');
  await page.type('#LogOnDetails_UserName', secrets.username);
  await page.type('#LogOnDetails_Password', secrets.password);
  await page.click('.sg-logon-button');

  // 2) GET DATA FROM 1ST PAGE
  await page.waitForSelector('.sg-homeview-table');

  const gradeData = await page.evaluate(() => {
    // TODO: Add ability to change students. Default is the 1st in alphabet.
    // document.querySelector('.sg-add-change-student').click();
    // document.querySelectorAll('.sg-student-picker-row');
    // etc. etc.
    const student = document.querySelector('.sg-banner-chooser .sg-banner-text').innerText;
    const records = [];

    // Save the array index when we push new data into it.
    const index = records.push({
      student,
      timestamp: (new Date()).toJSON(),
      currentAverage: [],
    }) - 1;

    document.querySelectorAll('.sg-homeview-table tbody tr')
      .forEach((el) => {
        records[index].currentAverage.push({
          class: el.querySelector('#courseName').textContent,
          grade: el.querySelector('#average').textContent,
        });
      });

    return records;
  });

  // 3) LOAD SECOND PAGE
  await page.goto('https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx',
    { waitUntil: 'networkidle2' });

  // 4) REFRESH VIEW
  await page.select('select#plnMain_ddlOrderBy', 'Date');
  // TODO: Allow to change report card run. Default is the most current.

  await Promise.all([
    page.waitForNavigation(),
    page.click('#plnMain_btnRefreshView'),
  ]);

  // 5) GET DATA FROM 2ND PAGE
  const classworkData = await page.evaluate(() => {
    const tableRows = document.querySelectorAll('#plnMain_dgAssignmentsByDate tbody .sg-asp-table-data-row');
    const tableData = [];

    // NOTE: Data formatting can be done at a later stage. Included here as a POC.

    tableRows
      .forEach((el) => {
        const tds = el.querySelectorAll('td');
        const course = tds[2].innerText;
        const classes = {
          '0731 - 14 Off Season': 'Off Season',
          '0776 - 12 Spanish I B': 'Spanish I B',
          '0827 - 17 Gateway 1': 'Gateway 1',
          '7720 - 38 Lang Arts 7 Tag': 'TAG Lang Arts 7',
          '7787 - 31 Tag Science 7': 'TAG Science 7',
          '7797 - 33 Tag Tx History': 'TAG TX History',
          '8750 - 29 Algebra I Tag': 'TAG Algebra I',
        };
        const category = tds[4].innerText;
        const majors = [
          'Assessment',
          'Major Grades',
          'Performance',
          'Project',
          'Test',
        ];
        // Category: a->assessment; d->daily
        const cat = majors.includes(category) ? 'a' : 'd';
        let score = tds[6].innerText;
        let note = '';

        if (score === 'M') {
          score = 0;
          note = 'M';
        }

        tableData.push({
          date: tds[0].innerText,
          course,
          class: classes[course],
          category,
          cat,
          score,
          note,
          assignment: tds[3].innerText,
        });
      });

    return tableData;
  });

  await browser.close();

  gradeData[0].classwork = classworkData;

  return gradeData;
};

scrape()
  .then((data) => {
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
      ),
    );
  });
