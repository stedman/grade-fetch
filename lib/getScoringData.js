/**
 * Get class assignment scoring breakdown from table.
 *
 * @param  {string}  rowElems  CSS selector for row elements.
 * @return {Array}   Class scoring data.
 */
module.exports = function getScoringData(rowElems) {
  const tableRows = document.querySelectorAll(rowElems);
  const tableData = [];

  tableRows
    .forEach((el) => {
      const tds = el.querySelectorAll('td');

      tableData.push({
        category: tds[0].innerText,
        studentPoints: tds[1].innerText,
        maxPoints: tds[2].innerText,
        percent: tds[3].innerText,
        weight: tds[4].innerText,
        points: tds[5].innerText
      });
    });

  return tableData;
};
