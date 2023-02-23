/* eslint-disable camelcase */
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const path = require('path');
const cors = require('cors');
const client = require('./database');
// const productsRouter = require('./Routes/products');

const reviewsRouter = require('./Routes/reviewsRoutes');

const app = express();

// ----- Middleware ----- //

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// app.use('/', reviewsRouter);

// ----- Routes ----- //

// ----- Products ----- //

app.use('/reviews', reviewsRouter);

app.post('/cart', (req, res) => {
  console.log('getting cart post request');
  console.log(`"${req.body.body}"`);
  axios({
    method: 'post',
    url: 'https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/cart',
    headers: { Authorization: process.env.AUTH_SECRET },
    data: {
      sku_id: 1,
    },
  })
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
    });
});

// -------------------------

// app.get('/reviews', (req, res) => {
//   console.log('GET request received from /reviews');
//   const { sort, product_id, count } = req.query;

//   axios.get('https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/reviews/', {
//     headers: {
//       Authorization: process.env.AUTH_SECRET,
//     },
//     params: {
//       product_id, // no review product is 37339
//       sort,
//       count, // figure out how to do max count
//     },
//   })
//     .then(({ data }) => {
//       res.status(200);
//       res.json(data);
//       res.end();
//     })
//     .catch(() => res.send('Error occurred when getting reviews from /reviews'));
// });

// app.post('/reviews', (req, res) => {
//   console.log('POST request received from /reviews');
//   const { data } = req.body;

//   axios.post('https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/reviews/', data, {
//     headers: {
//       Authorization: process.env.AUTH_SECRET,
//     },
//   }).then(() => {
//     console.log('Successful post!');
//     res.end();
//   }).catch(() => {
//     console.log('Error posting review to API endpoint');
//     res.end();
//   });
// });

// app.get('/reviews/meta', (req, res) => {
//   console.log('GET request received from /reviews/meta');
//   const { product_id } = req.query;

//   axios.get('https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/reviews/meta', {
//     headers: {
//       Authorization: process.env.AUTH_SECRET,
//     },
//     params: {
//       product_id,
//     },
//   })
//     .then(({ data }) => {
//       res.status(200);
//       res.json(data);
//     })
//     .catch(() => res.send('Error occurred when getting reviews from /reviews/meta'));
// });

// app.put('/reviews/:review_id/helpful', (req, res) => {
//   console.log('PUT request received from /reviews/:review_id/helpful');
//   const { review_id } = req.params;
//   // console.log(review_id);

//   axios.put(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/reviews/${review_id}/helpful`, null, {
//     headers: {
//       Authorization: process.env.AUTH_SECRET,
//     },
//   })
//     .then(() => {
//       console.log('Helpful vote successfully counted');
//       res.status(200);
//       res.end();
//     })
//     .catch((err) => {
//       // console.log(err);
//       console.log('Error occured with PUT request');
//       res.end();
//     });
// });

// app.put('/reviews/:review_id/report', (req, res) => {
//   console.log('PUT request received from /reviews/:review_id/report');
//   const { review_id } = req.params;
//   // console.log(review_id);

//   axios.put(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/reviews/${review_id}/report`, null, {
//     headers: {
//       Authorization: process.env.AUTH_SECRET,
//     },
//   })
//     .then(() => {
//       console.log('Review successfully reported and taken off');
//       res.status(200);
//       res.end();
//     })
//     .catch(() => {
//       console.log('Error occured with PUT request for reporting post');
//       res.end();
//     });
// });

app.get('/questions', (req, res) => {
  axios.get('https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/qa/questions', {
    headers: {
      Authorization: process.env.AUTH_SECRET,
    },
    params: {
      product_id: req.query.id,
      count: 100,
    },
  })
    .then(({ data }) => {
      console.log('Got Questions List');
      res.status(200);
      res.json(data);
      res.end();
    })
    .catch(() => res.send('Error occurred when getting questions from /qa/questions'));
});

app.post('/questions', (req, res) => {
  console.log(`"${req.body.body}"`);
  axios({
    method: 'post',
    url: 'https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/qa/questions',
    headers: { Authorization: process.env.AUTH_SECRET },
    data: {
      body: req.body.body,
      name: req.body.name,
      email: req.body.email,
      product_id: Number(req.body.product_id),
    },
  })
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/answers', (req, res) => {
  axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/qa/questions/${req.query.question_id}/answers`, {
    headers: {
      Authorization: process.env.AUTH_SECRET,
    },
    params: {
      count: 100,
    },
  })
    .then(({ data }) => {
      res.status(200);
      res.json(data);
    })
    .catch(() => res.send('Error occurred when getting questions from /qa/questions/answers'));
});

app.post('/answers', (req, res) => {
  console.log(req.body);
  axios({
    method: 'post',
    url: `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/qa/questions/${req.body.question_id}/answers`,
    headers: { Authorization: process.env.AUTH_SECRET },
    data: {
      body: req.body.body,
      name: req.body.name,
      email: req.body.email,
      photo: req.body.photo,
    },
  })
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/helpful', (req, res) => {
  axios.put(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/qa/${req.query.type}/${req.query.id}/helpful`, null, {
    headers: {
      Authorization: process.env.AUTH_SECRET,
    },
  })
    .then(() => {
      console.log('done');
      res.status(200);
    })
    .catch(() => res.send('Error occurred when updating helpfulness'));
});

app.post('/report', (req, res) => {
  console.log(req.body);
  axios.put(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/qa/answers/${req.body.answerId}/report`, null, {
    headers: {
      Authorization: process.env.AUTH_SECRET,
    },
  })
    .then(() => {
      console.log('REPORTED');
      res.status(204);
    })
    .catch(() => res.send('Error occurred when reporting'));
});

const PORT = 8081;

app.listen(PORT, (err) => { /*process.env.PORT*/
  if (err) console.log('error in server setup');
  console.log(`Listening at http://localhost:${PORT}...`);
  client.connect((err) => {
    if (err) {
      console.log('error connecting to db');
    } else {
      console.log('connecting to db...');
    }
  });
});

app.on('end', () => {
  client.end();
});

module.exports = app;
