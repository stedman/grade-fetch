const fs = require('fs');

/**
 * Saves data to file.
 *
 * @param  {object}  data       Data to save
 * @param  {string}  directory  Directory name
 * @param  {string}  fileName   File name
 */
const saveDataToFile = (data, directory, fileName) => {
  // Expect filenames to end with `json`.
  const reFileName = /^[-\w]+\.json$/;
  // Expect directories to have periods, slashes, dashes, underscores, letters, and numbers.
  const reDirectory = /^[./-\w]+$/;

  if (!reFileName.test(fileName)) {
    throw Error('FileName missing or of wrong format.');
  }
  if (!reDirectory.test(directory)) {
    throw Error('Directory missing or of wrong format.');
  }
  if (!data) {
    throw Error('Data missing.');
  }

  // Build the data path.
  const path = `${directory}/${fileName}`;

  // Create directory if it doesn't already exist.
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const dataFormatted = JSON.stringify(data, null, 2);

  fs.writeFile(path, dataFormatted, (writeErr) => {
    if (writeErr) {
      throw Error(`Data not written.\n${writeErr}`);
    }

    // eslint-disable-next-line no-console
    console.log(`Data written to: ${path}`);

    // Create archive copy of classwork file.
    const archiveDir = `${directory}/archive`;
    const archiveFile = fileName.replace('.json', `-${Date.now()}.json`);
    const archivePath = `${archiveDir}/${archiveFile}`;

    // Create archive directory if it doesn't already exist.
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }

    fs.copyFile(
      path,
      archivePath,
      (copyErr) =>
        /* eslint-disable no-console */
        copyErr
          ? console.error('Archive file not copied.', copyErr)
          : console.log(`Archive data copied to: ${archivePath}.`)
      /* eslint-enable no-console */
    );
  });
};

module.exports = saveDataToFile;
