const fs = require('fs');
const puppeteer = require('puppeteer');
const secrets = require('./secrets');

const scrape = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // Login.
  await page.goto('https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn',
    { waitUntil: 'networkidle2' });
  await page.waitForSelector('#LogOnDetails_UserName');
  await page.type('#LogOnDetails_UserName', secrets.username);
  await page.type('#LogOnDetails_Password', secrets.password);
  await page.click('.sg-logon-button');

  // First page of content.
  await page.waitForSelector('.sg-homeview-table');

  const data = await page.evaluate(() => {
    const student = document.querySelector('.sg-banner-chooser .sg-banner-text').innerText;
    const records = [];

    const recordIndex = records.push({
      student,
      timestamp: (new Date()).toJSON(),
      currentAverage: [],
    }) - 1;

    document
      .querySelectorAll('.sg-homeview-table tbody tr')
      .forEach((el) => {
        records[recordIndex].currentAverage.push({
          class: el.querySelector('#courseName').textContent,
          grade: el.querySelector('#average').textContent,
        });
      });

    return records;
  });

  // Second page of content.
  // await page.goto('https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx',
  //   { waitUntil: 'networkidle2' });
  // await page.waitForSelector('#LogOnDetails_UserName');

  await browser.close();

  return data;
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
      (err) => (err ? console.error('Data not written.', err) : console.log(`Data written to: ${filename}`)),
    );
  });
