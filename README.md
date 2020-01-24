# Student Data

> **WIP**: WORK IN PROGRESS

## Overview

This started out as a simple application to automatically retrieve grades from my kid's school website. I set up [Puppeteer](https://pptr.dev/) to scrape the site and save data to a local file. From there, I manually imported the data into a spreadsheet for further analysis and charting.

### Hey, there's an app in here

Now I could have gone down the path of building a better spreadsheet importer, but that wouldn't have been the *Web Developer Way™*. These analysis and visualization tools need to be made into a modern app.

I initially wanted to keep the app together in one repo for convenience sake. However, as I started looking into Nuxt, Next, et al, it seemed to make sense to keep those presentation layers completely separate to toy with implementation details.

So what we have now is a data application (student-data) responsible for collecting and sharing data and we will have at least one additional application for presenting the data (student-dash).

The following Roadmap continues to be provisional and will like change as time goes on.

### Roadmap

1. [x] Set up environment
   1. [x] Node (v12) + npm
   2. [x] Add [.editorconfig](https://editorconfig.org).
   3. [x] Install [ESLint](https://eslint.org).
   4. [x] Install [Prettier](https://prettier.io).
2. [x] Scrape student information from school website.
   1. [x] Install [Puppeteer](https://pptr.dev/).
   2. [x] Set up DOM selectors to capture page data.
   3. [x] Design data objects.
   4. [x] Store captured data (directly) in flat files.
3. [ ] Create REST API to save scraped data and retrieve for visualization.
   1. [x] Install [Express](https://expressjs.com) web framework.
   2. [x] Add rudimentary models and routes for data retrieval.
   3. [ ] Add models and routes for data saves.
   4. [ ] Migrate captured data saves to use API.
4. [x] Set up test framework.
   1. [x] Install [Jest](https://jestjs.io).
   2. [x] Add initial tests.
5. [x] Add GraphQL
   1. [x] Install [GraphQL](https://graphql.org/graphql-js/express-graphql/).
   2. [x] Add rudimentary schema and root values.
6. [x] Add presentation dashboard.
   1. [x] Install [Nuxt/Vue](https://nuxtjs.org).
   2. [x] Install [vue-charts](https://vue-chartjs.org/).
7. [ ] Migrate data from flat file to database.
   1. [ ] Install [MongoDB](https://mongodb.com) and [Mongoose]([https://](https://mongoosejs.com)).
   2. [ ] Migrate models from using flat files to using Mongoose.
8. [ ] Add authentication.
9. [ ] Migrate from local app to cloud.

#### Additional considerations for Roadmap

* Use Docker containers.
* Migrate to [Typescript](https://www.typescriptlang.org) for its type checking, autocompletion in VSCode, and because it's the latest hotness.
* Migrate to ES6 modules. Node 12+ supports the new format, but my initial tests failed. Add [Babel](https://babeljs.io)?
* Create a [ReactJS](https://reactjs.org) version of the presentation dashboard?

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
