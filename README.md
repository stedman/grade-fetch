# Student Data

> **WIP**: WORK IN PROGRESS

## Overview

This started out as a simple application to automatically retrieve grades from my kid's school website. I set up [Puppeteer](https://pptr.dev/) to scrape the site and save data to a local file. From there, I manually imported the data into a spreadsheet for further analysis and charting.

### Hey, there's an app in here

Now I could have gone down the path of building a better spreadsheet importer, but that wouldn't have been the *Web Developer Way™*. These analysis and visualization tools are just begging to be made into a modern application.

I initially wanted to keep the app together in a monorepo for convenience sake (e.g., shared packages, synced releases). However, as I started looking into [Nuxt](https://nuxtstack.org/), [Next](https://nextjs.org/), et al, it seemed to make sense to keep those presentation layers completely separate to toy with implementation details.

So what we have now is a data application (student-data) responsible for collecting and sharing data and we will have at least one additional application for presenting the data (student-dash).

The following Roadmap continues to be provisional and will like change as time goes on.

### Roadmap

1. Set up environment
    1. [x] Node (v12) + npm
        * Node is an obvious starting point and v12 is the latest [LTS (long-term support) release](https://nodejs.org/en/about/releases/).
        * While I personally use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions, that use is optional here.
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
    2. [x] Set up DOM selectors to capture page data.
    3. [x] Design data objects.
    4. [x] Store captured data (directly) in flat files.
3. Create REST API to save scraped data and retrieve for visualization.
    1. [x] Install [Express](https://expressjs.com) web framework.
    2. [x] Add rudimentary models and routes for data retrieval.
    3. [ ] Add models and routes for data mutations: create, update, and delete.
    4. [ ] Migrate captured data mutations to use API.
4. Set up test framework.
    1. [x] Install [Jest](https://jestjs.io).
    2. [x] Add initial tests.
5. Add GraphQL
    1. [x] Install [GraphQL](https://graphql.org/graphql-js/express-graphql/).
    2. [x] Add rudimentary schema and root values.
6. Add presentation dashboard.
    1. [x] Install [Nuxt/Vue](https://nuxtjs.org).
    2. [x] Install [vue-charts](https://vue-chartjs.org/).
7. Migrate data from flat file to database.
    1. [ ] Install [MongoDB](https://mongodb.com) and [Mongoose]([https://](https://mongoosejs.com)).
    2. [ ] Migrate models from using flat files to using Mongoose.
8. Add authentication.
    1. [ ] TODO
9. Migrate from local app to cloud.
    1. [ ] TODO

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

## Run

```sh
npm start
```

### Scrape

```sh
node rrisd
```

## Test

```sh
npm test
```

## Helpful resources

* Puppeteer
  * https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md
  * https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
