const request = require('supertest');
const assert = require('assert');
const express = require('express');

const app = require('../indexWithBackend');

request(app)
  .get('/r/reviews?product_id=4&sort=newest&count=500')
  .expect('Content-Type', /json/)
  .expect(200)
  .end((err, res) => {
    if (err) {
      console.log('r/reviews: tests failed');
      throw err;
    } else {
      console.log('r/reviews: tests passed');
    }
  });

request(app)
  .get('/r/meta?product_id=555123')
  .expect('Content-Type', /json/)
  .expect(200)
  .end((err, res) => {
    const data = JSON.parse(res.text);
    console.log(
      `Product id: ${data[0].product_id}, ${data[0].product_id === 555123}`,
    );
    console.log(
      `Product id: ${data[0].recommended}, ${data[0].recommended.length === 2}`,
    );
    console.log(
      `Product id: ${data[0].characteristics}, ${data[0].characteristics.length === 4}`,
    );
    console.log(
      `Product id: ${data[0].ratings}, ${data[0].ratings.length === 4}`,
    );
    if (err) {
      console.log('r/meta: tests failed');
      throw err;
    } else {
      console.log('r/meta: tests passed');
    }
});
