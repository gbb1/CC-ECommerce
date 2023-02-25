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
const reviewsRouter = require('./Routes/reviewsRoutes');
const productsRouter = require('./Routes/products');
const reviewsDb = require('./database');

const app = express();

// ----- Middleware ----- //

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
// prefix route for router

app.use('/qa', qAndARouter);
app.use('/reviews', reviewsRouter);
app.use('/products', productsRouter);

app.get('/loaderio-a00e353a494395bebcfb699828d9a511', (req, res) => {
  console.log('GETTING REQUEST');
  res.send('loaderio-a00e353a494395bebcfb699828d9a511');
});

app.listen(3000, () => {
  reviewsDb.connect();
  console.log('Server started on port 3000');
});

module.exports = app;
