const secrets = require('../../config/.secrets');

// Make sure 'secrets' data is set up properly.
if (!(secrets && secrets.username && secrets.password && secrets.student)) {
  throw Error(
    'Missing config file. Please create /config/.secrets.js file based on /test/config/.secrets.js'
  );
}

/**
 * Logs into site.
 *
 * @param  {object}  page    Puppeteer page context.
 */
const login = async (page) => {
  const loginSel = {
    username: '#LogOnDetails_UserName',
    password: '#LogOnDetails_Password',
    submit: '#login'
  };

  await page.waitForSelector(loginSel.username);
  await page.type(loginSel.username, secrets.username);
  await page.type(loginSel.password, secrets.password);
  await page.click(loginSel.submit);
};

module.exports = login;
