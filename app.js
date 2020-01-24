const express = require('express');
const graphqlHTTP = require('express-graphql');

const graphqlSchema = require('./routes/graphql/schema');
const graphqlRootValue = require('./routes/graphql/rootValue');

const apiRouteStudents = require('./routes/api/students');

const app = express();

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

app.use((req, res) => {
  res.status(404).send('Sorry, cannot find that.');
});

module.exports = app;
