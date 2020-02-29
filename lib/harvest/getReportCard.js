const getReportCard = async (page) => {
  const rootUrl = 'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student';

  // 1) LOAD PAGE
  await page.goto(`${rootUrl}/ReportCard.aspx`, { waitUntil: 'domcontentloaded' });

  // 2) GET DATA
  /**
   * Harvest report card data.
   *
   * @return {Object}  Report Card data
   */
  const reportCardData = await page.evaluate(() => {
    /**
     * Helper function to cleanup DOM to text.
     *
     * @param {node}    element   DOM element
     * @param {boolean} [number]  Coerce to Number?
     */
    const extractText = (element, number) => {
      let text = '';

      if (element !== undefined) {
        text = element.innerText.trim();

        if (number && text !== '') {
          text = +text;
        }
      }

      return text;
    };

    // Since Report Card table columns depend on the Grading (Marking) Period, we need to grab the
    // MP(n) columns a bit more dynamically. Start by gathering column headers...
    const tableRowKeys = [];
    document
      .querySelector('.sg-asp-table-header-row')
      .querySelectorAll('td')
      .forEach((el) => {
        let key = '';

        if (el && el.innerText) {
          key = el.innerText.toLowerCase().replace(/\. ?(\w)/, (match, firstLetter) => {
            return firstLetter.toUpperCase();
          });
        }

        tableRowKeys.push(key);
      });
    const tableRowEls = document.querySelectorAll('.sg-asp-table-data-row');
    const rowData = [];

    tableRowEls.forEach((rowEl) => {
      const tdEls = rowEl.querySelectorAll('td');
      const tdLength = tdEls.length;
      const teacherAEl = tdEls[3].querySelector('a');
      // ...get the columns that follow the initial columns ending with Att.Credit and Ern.Credit
      // but before the columns that follow COM1, COM2 at the end of the table...
      const dynamicData = tableRowKeys.slice(3, tdLength - 1).forEach((obj, key, idx) => {
        // eslint-disable-next-line no-param-reassign
        obj[key] = extractText(tdEls[idx + 3]);

        return obj;
      }, {});

      // ...then squish them all together.
      rowData.push({
        courseId: extractText(tdEls[0]),
        courseName: extractText(tdEls[1]),
        period: extractText(tdEls[2]),
        teacher: {
          name: extractText(tdEls[3]),
          email: teacherAEl ? teacherAEl.getAttribute('href').substring(7) : undefined
        },
        ...dynamicData,
        tardy: extractText(tdEls[tdLength - 6]),
        excusedAbsence: extractText(tdEls[tdLength - 5]),
        unexcusedAbsence: extractText(tdEls[tdLength - 4]),
        ytdTardy: extractText(tdEls[tdLength - 3]),
        ytdExcusedAbsence: extractText(tdEls[tdLength - 2]),
        ytdUnexcusedAbsence: extractText(tdEls[tdLength - 1])
      });

      return rowData;
    });
  });

  return reportCardData;
};

module.exports = getReportCard;
