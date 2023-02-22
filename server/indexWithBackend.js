/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const qAndARouter = require('./Routes/qAndARoutes');
const { connectClient, closeClient } = require('./database');

const app = express();

// ----- Middleware ----- //

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
// prefix route for router
app.use('/qa', qAndARouter);

connectClient().then(() => {
  const server = app.listen(3000, () => {
    console.log('Server started on port 3000');
  });

  server.on('close', () => {
    closeClient();
    console.log('server closed');
  });
});
