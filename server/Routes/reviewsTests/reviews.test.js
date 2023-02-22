import '@testing-library/jest-dom';

const request = require('supertest');
const assert = require('assert');
const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = require('../indexWithBackend');

// const db = new Client({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT,

// });

// (asyc () => {
//   await request(app)
//   .get('/r/reviews?product_id=4&sort=newest&count=500');
// })();

describe('Get Endpoints', () => {
  it('should get product reviews in under 50ms', async () => {
    const res = await request(app)
      .get('/r/reviews?product_id=4&sort=newest&count=500');

    const start2 = Date.now();
    const res2 = await request(app)
      .get('/r/reviews?product_id=1000010&sort=newest&count=5')
      .then(() => {
        const end2 = Date.now();
        const responseTime2 = end2 - start2;
        console.log('Product reviews: ', responseTime2);
        expect(responseTime2).toBeLessThan(50);
      });
  });

  it('should get reviews meta in under 50ms', async () => {
    const res = await request(app)
      .get('/r/reviews?product_id=4&sort=newest&count=500');

    const start2 = Date.now();
    const res2 = await request(app)
      .get('/r/meta?product_id=1000010')
      .then(() => {
        const end2 = Date.now();
        const responseTime2 = end2 - start2;
        console.log('Product Meta: ', responseTime2);
        expect(responseTime2).toBeLessThan(50);
      });
  });

  it('should post a review in under 50ms', async () => {
    const res = await request(app)
      .get('/r/meta?product_id=1000010');

    const start = Date.now();
    const res2 = await request(app)
      .post('/r/reviews?product_id=20000000&rating=5&summary=\'summary\'&body=\'body\'&recommend=true&reviewer_name=\'Testo\'&reviewer_email=\'testo@test.com\'&photos=[one.com,two.com,three.com]')
      .then(() => {
        const end2 = Date.now();
        const responseTime2 = end2 - start;
        console.log('Posting review: ', responseTime2);
        expect(responseTime2).toBeLessThan(50);
      });
  });

  it('should mark helpful in under 50ms', async () => {
    const res = await request(app)
      .get('/r/meta?product_id=1000010');

    const start = Date.now();
    const res2 = await request(app)
      .put('/r/reviews/2000000/helpful')
      .then(() => {
        const end = Date.now();
        const responseTime = end - start;
        console.log('Marking helpful ', responseTime);
        expect(responseTime).toBeLessThan(50);
      });
  });

  it('should report a review in under 50ms', async () => {
    const res = await request(app)
      .get('/r/meta?product_id=1000010');

    const start = Date.now();
    const res2 = await request(app)
      .put('/r/reviews/2000000/report')
      .then(() => {
        const end = Date.now();
        const responseTime = end - start;
        console.log('Reporting review ', responseTime);
        expect(responseTime).toBeLessThan(50);
      });
  });

  // it('should get product reviews in under 50ms', async () => {
  //   const res = await request(app)
  //     .get('/r/reviews?product_id=4&sort=newest&count=500');

  //   let i = 0;
  //   let sum = 0;
  //   while (i < 5) {
  //     const start2 = Date.now();
  //     const res2 = await request(app)
  //       .get('/r/reviews?product_id=1000010&sort=newest&count=5')
  //       .then(() => {
  //         const end2 = Date.now();
  //         sum += (end2 - end1);
  //         i++;
  //       });
  //   }
  //   console.log('Product reviews: ', sum / 5);
  //   expect(sum / 5).toBeLessThan(50);
  // });
});
