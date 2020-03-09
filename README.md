# Student Data

This is a combination data harvester and API for making RRISD Home Access records more accessible and useful. There is an associated [presentation application](https://github.com/stedman/student-dash-nuxt) for viewing data in chart form.

---

## On this page

* [How it works](#how-it-works)
* [Use](#use)
* [Background](#background)
* [Roadmap](#roadmap)

---

## How it works

> **WIP**: As this is a work in progress, there may be some unexpected bugs. Use at your own peril.

### Harvester

1. Logs into Home Access with your credentials.
2. Gathers student data associated with your account.
3. For each student:
   1. Gathers additional student information.
   2. Gathers student classwork and grades.
4. Saves all student data.

### API

Provides the following data:

* All students.
* Individual student information.
* Individual student classwork.
* Individual student grades.
* Individual student grade averages.

---

## Use

After forking and cloning this repo to your local device, navigate to the app directory and run install.

```sh
npm install
```

Create a `.env` file at the project root and add your RRISD Home Access login credentials like so:

```
RRISD_USERNAME=your_username
RRISD_PASSWORD=your_password
```

### Harvest

```sh
node run harvestall  # run on initial harvest
node run harvest
```

The harvest process takes 10-15 seconds on average to complete. Please be patient. At present, it needs to be run manually to update data.

On 1st run, a `student.json` data file is created in the data directory. Until I come up with a better process, delete this file at the beginning of each school year.

### Run

```sh
npm start
```

For REST API, use [Postman](https://getpostman.com) or your browser to *get* http://localhost:3001/api/v1/students . See the OpenAPI schema at `./routes/api/schema.yml` for more details.

For GraphQL, point your browser to http://localhost:3001/graphql . See the GraphQL schema at `./routes/graphql/schema.js`.

### Test

```sh
npm test
```

---

## Background

The goal was simple. I wanted a convenient way to periodically review my kids' school grades with them — before the end of the grading periods and the final reports were printed.

Fortunately, the grades for my kids' classwork and tests are available online and are as up-to-date as the teachers can manage. Unfortunately, the RRISD Home Access website needs some serious UX love. Logging-in and navigating to the necessary pieces of data is quite a chore.

### First requirement: data

My first approach was to login to the site, manually copy the classwork and daily course data, and then plug those pieces of information into a spreadsheet. This allowed me to manipulate the data and present it in a meaningful way, but it was an obviously laborious undertaking and subject to data entry errors.

I dug around the site code in search of an API to ease the pain but found nothing. So I chose to go the data harvesting route.

[Puppeteer](https://pptr.dev/) is a nifty headless Chrome library that I've used in the past to run end-to-end tests. I figured it might just work as well at harvesting data from sites. From there, I could automate the flow of data into a spreadsheet for further analysis and charting.

### Second requirement: presentation

Better yet, I could create a dashboard application that would stitch together elements useful for daily K-12 student life (e.g., school menus, weather (for recess/gym), Google Classroom calendars). This application could also be configured to send text messages for upcoming or late classwork, favorite menu items being served today, etc.

### Execution

The repos for this project are broken up into the two base requirements: 1) collect/expose data; and 2) present data. I considered a monorepo to house these two sub-projects early on, but decided against it to keep the presentation layer as flexible as possible. I knew I wanted to try out [Nuxt/Vue](https://nuxtjs.org/) and [Next/React](https://nextjs.org/), and perhaps even a Python variant, so keeping the presentation sub-project separate made a lot of sense.

In addition to Puppeteer, the data sub-project uses a tech stack that should be familiar: ExpressJS, MongoDB, OpenAPI, and GraphQL.

---

## Roadmap

The following Roadmap is provisional and will likely evolve:

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
2. Harvest student information from school website.
    1. [x] Install [Puppeteer](https://pptr.dev/).
        * Puppeteer is a headless Chrome library that can be used to access web pages and their content via a robust API.
        * API ref: https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md
        * tutorial ref: https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
    2. [x] Set up DOM selectors to capture page data.
        * I had all good intentions of creating a site-agnostic harvester but soon realized that the task of decoupling pages, selectors, and actions was overwhelming. So I backed off and went with a RRISD Home Access specific implementation.
    3. [x] Design data objects.
    4. [x] Store captured data (directly) in flat files.
        * Flat files are simple and flexible for the discovery phase. When the schema settles down, we can move to MongoDB.
3. Create REST API to save harvested data and retrieve for visualization.
    1. [x] Install [Express](https://expressjs.com) web framework.
    2. [x] Add rudimentary models and routes for data retrieval.
        * [ ] Implement OpenAPI
    3. [ ] Add models and routes for data mutations: create, update, and delete.
    4. [ ] Migrate harvester output and other data mutations to use API.
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
7. Add presentation dashboard.
    1. [x] Install [Nuxt/Vue](https://nuxtjs.org).
    2. [x] Install [vue-charts](https://vue-chartjs.org/).
8. Harden [ExpressJS security](https://expressjs.com/en/advanced/best-practice-security.html) (also review [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) and [OWASP NodeJS Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_security_cheat_sheet.html))1
    1. [x] Install [Helmet](https://www.npmjs.com/package/helmet).
    2. [x] Install [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit).
    3. [x] Install [CORS](https://www.npmjs.com/package/cors).
    4. [ ] Install authentication (e.g., [Auth0](https://auth0.com/docs/quickstart/backend/nodejs)).
    5. [ ] Validate all inputs (e.g., paths, queries).
    6. [ ] Validate `content-type`.
    7. [ ] Update all response errors to be more generic. Review HTTP status codes.
9. Migrate data from flat file to database.
    1. [ ] Install [MongoDB](https://mongodb.com) and [Mongoose]([https://](https://mongoosejs.com)).
    2. [ ] Migrate models from using flat files to using Mongoose.
10. Improve [ExpressJS performance](https://expressjs.com/en/advanced/best-practice-performance.html)
11. Migrate from local app to cloud.
    1. [ ] // TODO: Set up cloud solution.
    2. [ ] // TODO: Set up CI/CD.
12. Add onboarding script.
    1. [ ] // TODO: devise more secure method of storing login credentials.
    2. [ ] // TODO: create onboarding script to get/save login credentials and then harvest initial student data.

### Additional considerations for Roadmap

* Migrate to ECMAScript Modules (ESM). If [Node 12+ ESM implementation](https://nodejs.org/docs/latest-v12.x/api/esm.html) doesn't work, add [Babel](https://babeljs.io) as a dependency?
* Migrate to [Typescript](https://www.typescriptlang.org) for its type checking, autocompletion in VSCode, and because it's the latest hotness.
* Use Docker containers.
