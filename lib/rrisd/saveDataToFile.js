const fs = require('fs');

/**
 * Saves data to file.
 *
 * @param  {object}  data     The data
 * @param  {string}  dataDir  The data directory
 */
const saveDataToFile = (data, dataDir) => {
  // Save the data.
  const filename = 'classwork.json';
  const path = `${dataDir}/${filename}`;

  // Create output directory if it doesn't already exist.
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  fs.writeFile(path, JSON.stringify(data, null, 2), (wrErr) => {
    if (wrErr) {
      throw Error(`Data not written.\n${wrErr}`);
    }

    // eslint-disable-next-line no-console
    console.log(`Data written to: ${path}`);

    // Create archive copy of classwork file.
    const archiveDir = `${dataDir}/archive`;
    const archiveFile = filename.replace('.json', `-${Date.now()}.json`);
    const archivePath = `${archiveDir}/${archiveFile}`;

    // Create output directory if it doesn't already exist.
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }

    fs.copyFile(path, archivePath, (cpErr) =>
      cpErr
        ? // eslint-disable-next-line no-console
          console.error('Archive file not copied.', cpErr)
        : // eslint-disable-next-line no-console
          console.log(`Archive data copied to: ${archivePath}.`)
    );
  });
};

module.exports = saveDataToFile;
