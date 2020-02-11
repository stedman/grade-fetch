const express = require('express');
const graphqlHTTP = require('express-graphql');

const graphqlSchema = require('./routes/graphql/schema');
const graphqlRootValue = require('./routes/graphql/rootValue');

const apiRouteStudents = require('./routes/api/students');

const app = express();

// CORS setting
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// LOGGING
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`${new Date().toUTCString()}  ${req.method}  ${req.originalUrl}`);
  next();
});

// GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlRootValue,
    graphiql: true
  })
);
// API
app.use('/api/v1/students', apiRouteStudents);

// error handling
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error'
    }
  });
});

module.exports = app;
