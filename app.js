const express = require('express');
const studentRoutes = require('./routes/api/students');

const app = express();

app.use('/students', studentRoutes);

app.use((req, res) => {
  res.status(404).send('Sorry, cannot find that.');
});

module.exports = app;
