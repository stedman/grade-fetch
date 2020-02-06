const env = require('dotenv').config();

if (env.error) {
  throw env.error;
}

const secrets = {
  username: process.env.RRISD_USERNAME,
  password: process.env.RRISD_PASSWORD
};

// Make sure '.env' vars are set.
if (!(secrets.username && secrets.password)) {
  throw Error('Missing .env values for: RRISD_USERNAME, RRISD_PASSWORD');
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
