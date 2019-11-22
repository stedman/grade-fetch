# Grade Fetch

This is a simple [Puppeteer](https://pptr.dev/) app that retrieves online student records and then saves the results to a local JSON file.

## Install

```sh
yarn install
```

## Run

```sh
node rrisd
```

## Test

```sh
yarn test
```

## To Do

* Provide data analysis and charting.
* Provide ability to schedule script auto run times (e.g., daily).
* Migrate app from desktop to hosted/cloud solution.
* Provide ability to choose student. Present implementation only retrieves default student data -- the first child's name (listed alphabetically).
* Provide ability to change *Report Card Run* on classwork page. Present implementation only retrieves the default run -- the current time period.
