const fs = require('fs');
const puppeteer = require('puppeteer');
const getStudents = require('./getStudents');
const changeStudent = require('./changeStudent');
const initStudentData = require('./initStudentData');
const getGrades = require('./getGrades');
const saveDataToFile = require('./saveDataToFile');

const dataFile = {
  // TODO: May want to change 'data' to 'tmp' directory.
  dir: './data',
  student: 'student.json',
  grade: 'grade.json'
};

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

  // 1) FETCH STUDENT NAME AND ID
  const studentData = await getStudents(page);
  const studentKeys = Object.keys(studentData);
  const studentRecord = {};
  const classworkRecord = {};

  // 2) LOOP OVER EACH STUDENT
  /* eslint-disable no-await-in-loop */
  for (let idx = 0; idx < studentKeys.length; idx += 1) {
    const studentId = studentKeys[idx];

    // 3) CHANGE STUDENT SESSION (for each student after 1st round)
    if (idx !== 0) {
      await changeStudent(page, studentId);
    }

    // 4) INITIALIZE ADDITIONAL STUDENT DATA (on initial run only)
    // TODO: Don't look, I should be using async methods.
    if (!fs.existsSync(`${dataFile.dir}/${dataFile.student}`)) {
      const studentDetail = await initStudentData(page);

      studentRecord[studentId] = {
        name: studentData[studentId].name,
        ...studentDetail
      };
    }

    // 5) GET CLASSWORK
    classworkRecord[studentId] = await getGrades(page);
  }
  /* eslint-enable no-await-in-loop */

  await browser.close();

  return {
    student: studentRecord,
    classwork: classworkRecord
  };
};

// 6) (RUN HARVESTER and then) SAVE DATA
harvest().then((data) => {
  saveDataToFile(data.student, dataFile.dir, 'student.json', true);
  saveDataToFile(data.classwork, dataFile.dir, 'grades.json');
});
