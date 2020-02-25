const env = require('dotenv').config();

if (env.error) {
  throw env.error;
}

// Get login credentials from `.env` file at directory root.
const secrets = {
  username: process.env.RRISD_USERNAME,
  password: process.env.RRISD_PASSWORD
};

// Make sure '.env' vars are set.
if (!secrets.username) {
  throw Error('Missing .env value for: RRISD_USERNAME');
}
if (!secrets.password) {
  throw Error('Missing .env value for: RRISD_PASSWORD');
}

/**
 * Log into site.
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
