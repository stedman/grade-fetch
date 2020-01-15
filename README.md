# Grade Fetch

## Overview

This started out as a simple application to automatically retrieve grades from my kid's school website. I set up [Puppeteer](https://pptr.dev/) to scrape the site and save data to a local file. From there, I manually imported the data into a spreadsheet for further analysis and charting.

### Hey, there's an app in here

Now I could have gone down the path of building a better spreadsheet importer, but that wouldn't have been the *Web Developer Way™*. These analysis and visualization tools need to be made into a modern app.

I chose to keep the app together and in one repo for the time being for convenience sake. It may make sense to break it up into data `fetch` (scrape), `model` (API), and `view` pieces once the project matures. The following Roadmap is provisional and will like change as time goes on.

### Roadmap

1. [x] Set up environment: [ESLint](https://eslint.org)
2. [x] Add [Puppeteer](https://pptr.dev/) to scrape student information.
3. [ ] Create API to save scraped data and retrieve for visualization.
   1. [x] Add [Express](https://expressjs.com) web framework. Set up rudimentary data, models, and routes.
   2. [x] Add [Jest](https://jestjs.io) and initial tests
   3. [ ] Add [MongoDB](https://mongodb.com) + [Mongoose](https://) and migrate data from flat files.
4. [ ] Add [Vue](https://nuxtjs.org) templating.
5. [ ] Add charting.
6. [ ] Move from local app to cloud... AWS??

---

## Install

```sh
yarn install
```

## Run

```sh
yarn start
```

### Scrape

```sh
node rrisd
```

## Test

```sh
yarn test
```

## Helpful resources

* Puppeteer
  * https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md
  * https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
