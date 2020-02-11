# Student Data

> **WIP**: WORK IN PROGRESS

## Overview

The goal was simple. I wanted a convenient way to periodically review my kids' school grades with them — before the interim and final reports were printed.

Fortunately, grades for classwork and tests are online for my kids and are as up-to-date as the teachers can manage. Unfortunately, the website hasn't aged well. Logging-in and navigating to the necessary pieces of data was quite a chore.

### First requirement: data

My first solution was to login to the site, manually copy classwork data and daily course averages, and then paste them into a spreadsheet. The solved the need to manipulate the data as needed and present it in a meaningful way, but it was obviously laborious and subject to data entry errors.

I looked for an API to ease the pain but none were to be found. So I chose to go the data scraping route. While it would be fun to toy with Python and BeautifulSoup, I chose to keep the learning curve short and stick with Node.

[Puppeteer](https://pptr.dev/) is a pretty neat headless Chrome library that I've used in the past to run end-to-end tests. I figured it would work just as well at scraping sites and then saving the data to a local file. From there, the data file could be imported into a spreadsheet for further analysis and charting. But that seemed silly given all the amazing dataviz libraries available today.

### Second requirement: presentation

The design pattern needed here is clearly a dashboard — a place to assemble all the daily student information in one screen. What was initially a concept to help review grades could be extended to display other pertinent information such as cafeteria menus, recess weather forecasts, and calendars. Furthermore, this application could be configured to send text messages for late classwork, favorite menu items being served today, etc.

### Execution

The repos for this project are broken up into the two base requirements: 1) collect/expose data; and 2) present data. I considered a monorepo to house these two sub-projects early on, but decided against it to keep the presentation layer as flexible as possible. I knew I wanted to try out [Nuxt/Vue](https://nuxtjs.org/) and [Next/React](https://nextjs.org/), and perhaps even a Python variant, so keeping the presentation sub-project separate made a lot of sense.

In addition to Puppeteer, the data sub-project uses a tech stack that should be familiar: ExpressJS, MongoDB, OpenAPI, and GraphQL.

### Roadmap

The following Roadmap continues to be provisional and will likely change as time goes on:

1. Set up environment
    1. [x] Node (v12) + npm
        * Node is an obvious starting point and v12 is the latest [LTS (long-term support) release](https://nodejs.org/en/about/releases/).
        * I recommend [nvm](https://github.com/nvm-sh/nvm) to manage Node versions, but it is optional here.
        * [npm](https://www.npmjs.com/) is Node's baked-in package manager and does its job pretty well. [Yarn](https://yarnpkg.com/) is a solid alternative.
    2. Automate code formatting and static analysis.
        1. [x] Add [.editorconfig](https://editorconfig.org).
            * EditorConfig is a basic, universal code-style enforcer. Provided the IDE/editor can read the config file straight out of the box or with a plugin, EditorConfig is a great first step. It essentially gives the IDE/editor a set of rules to follow for indentions, line-endings, etc.
        2. [x] Install [ESLint](https://eslint.org).
            * Whether you're working on a team or alone, ESLint will change your life. Set a standard and let the robots do the dirty work of checking and fixing your code. Free your mind to solve bigger problems than syntax errors, unused variables, and tab spaces.
            * Configuring [ESLint rules](https://eslint.org/docs/rules/) is the most important step. While there are several options out there, the [Airbnb config](https://www.npmjs.com/package/eslint-config-airbnb) remains one of the most ubiquitous and practical to use. The rules are reasonable, are very [well-documented](https://github.com/airbnb/javascript), and can be easily overrided locally.
        3. [x] Install [Prettier](https://prettier.io).
            * Prettier is the newest player here and takes code formatting one extra step. Its basic rules are applied upon save to reformat indents, line length, quotation marks, etc.
2. Scrape student information from school website.
    1. [x] Install [Puppeteer](https://pptr.dev/).
        * Puppeteer is a headless Chrome library that can be used to access web pages and their content via a robust API.
        * API ref: https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md
        * tutorial ref: https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
    2. [x] Set up DOM selectors to capture page data.
        * The current setup has the config and code very tightly coupled to a specific site.
            * [ ] // FIXME: refactor scraping operation to decouple config, code, and site.
    3. [x] Design data objects.
    4. [x] Store captured data (directly) in flat files.
        * Flat files are simple and flexible for the discovery phase. When the schema settles down, we can move to MongoDB.
3. Create REST API to save scraped data and retrieve for visualization.
    1. [x] Install [Express](https://expressjs.com) web framework.
    2. [x] Add rudimentary models and routes for data retrieval.
        * [ ] Implement OpenAPI
    3. [ ] Add models and routes for data mutations: create, update, and delete.
    4. [ ] Migrate scraper output and other data mutations to use API.
4. Set up test framework.
    1. [x] Install [Jest](https://jestjs.io).
    2. [x] Add initial tests.
5. Add GraphQL
    1. [x] Install [GraphQL](https://graphql.org/graphql-js/express-graphql/).
    2. [x] Add rudimentary schema and root values.
6. Formalize REST API into OpenAPI spec.
    1. [x] Create schema.yaml.
        * Getting inspiration from the fantastic [Learn API Doc](https://idratherbewriting.com/learnapidoc/pubapis_openapi_step1_openapi_object.html) instructions, I cracked open [Stoplight Studio](https://stoplight.io/p/studio/) and started writing the OpenAPI schema for this project. The process was illuminating and helped me refactor the REST endpoints and even the data models. Although I believe I initially needed to build a straw man API to test several ideas, it's now time to pave the cowpaths via this schema building process.

            The process of building a schema clarifies the intentions and purpose of the API. Defining paths, queries, descriptions, types, etc. forces a consideration each atomic piece and its relationship to the whole.

            Further on down the road, I am hopeful that a solid spec and the OpenAPI validator will help preserve a working API even as this app evolves — much as unit tests do for code refactoring.
    2. [ ] Install [express-openapi](https://github.com/kogosoftwarellc/open-api/tree/master/packages/express-openapi).
    3. [ ] Install [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator).
7. Harden [ExpressJS security](https://expressjs.com/en/advanced/best-practice-security.html)
    1. [x] Install [Helmet](https://www.npmjs.com/package/helmet)
    2. [x] Install [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)
8. Add presentation dashboard.
    1. [x] Install [Nuxt/Vue](https://nuxtjs.org).
    2. [x] Install [vue-charts](https://vue-chartjs.org/).
9. Migrate data from flat file to database.
    1. [ ] Install [MongoDB](https://mongodb.com) and [Mongoose]([https://](https://mongoosejs.com)).
    2. [ ] Migrate models from using flat files to using Mongoose.
10. Add authentication.
    1. [ ] // TODO: add express authentication
11. Improve [ExpressJS performance](https://expressjs.com/en/advanced/best-practice-performance.html)
12. Migrate from local app to cloud.
    1. [ ] // TODO: migrate to cloud

#### Additional considerations for Roadmap

* Migrate to ECMAScript Modules (ESM). If [Node 12+ ESM implementation](https://nodejs.org/docs/latest-v12.x/api/esm.html) doesn't work, add [Babel](https://babeljs.io) as a dependency?
* Migrate to [Typescript](https://www.typescriptlang.org) for its type checking, autocompletion in VSCode, and because it's the latest hotness.
* Create a [ReactJS](https://reactjs.org) version of the presentation dashboard?
* Use Docker containers.

---

## Install

```sh
npm install
```

Create a `.env` at the project root and add your Home Access login credentials:

```sh
RRISD_USERNAME=your_username
RRISD_PASSWORD=your_password
```

## Run

```sh
npm start
```

### Scrape

```sh
node run scrape
```

## Test

```sh
npm test
```
