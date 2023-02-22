/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../database');

async function reviewsETL() {
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS test, products, reviews, photos, characteristics;');

  db
    .query(`
      CREATE TABLE IF NOT EXISTS reviews (
        product_id INT NOT NULL,
        id SERIAL PRIMARY KEY NOT NULL,
        rating INT NOT NULL,
        summary VARCHAR NOT NULL,
        body VARCHAR NOT NULL,
        date VARCHAR NOT NULL,
        recommend VARCHAR,
        reviewer_name VARCHAR NOT NULL,
        reviewer_email VARCHAR NOT NULL,
        reported VARCHAR,
        response VARCHAR,
        helpfulness INT
      );`)
    .catch((e) => console.log(e));
  db
    .query(`
      COPY reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
        FROM '${path.join(__dirname, '../../../../../../../private/tmp/data/reviews.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function photosETL() {
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS photos;');

  db
    .query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY NOT NULL,
        review_id INT REFERENCES reviews(id),
        url VARCHAR NOT NULL
      );`)
    .catch((e) => console.log(e));
  db
    .query(`
      COPY photos(id, review_id, url)
        FROM '${path.join(__dirname, '../../../../../../../private/tmp/data/reviews_photos.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function charsETL() {
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS characteristics;');

  db
    .query(`
      CREATE TABLE IF NOT EXISTS characteristics (
        id SERIAL PRIMARY KEY NOT NULL,
        product_id INT NOT NULL,
        name VARCHAR NOT NULL
      );`)
    .catch((e) => console.log(e));
  db
    .query(`
      COPY characteristics(id, product_id, name)
        FROM '${path.join(__dirname, '../../../../../../../private/tmp/data/characteristics.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function charsReviewsETL() {
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS characteristic_reviews;');

  db
    .query(`
      CREATE TABLE IF NOT EXISTS characteristic_reviews (
        id SERIAL PRIMARY KEY NOT NULL,
        characteristic_id INT REFERENCES characteristics(id),
        review_id INT REFERENCES reviews(id),
        value INT NOT NULL
      );`)
    .catch((e) => console.log(e));
  db
    .query(`
      COPY characteristic_reviews(id, characteristic_id, review_id, value)
        FROM '${path.join(__dirname, '../../../../../../../private/tmp/data/characteristic_reviews.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function buildRecommendTable() {
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS recommended;');

  db
    .query(`
      SELECT product_id, id PRIMARY KEY, recommend, count
      INTO recommended
      FROM (
        SELECT
          product_id,
          id,
          recommend,
          count(recommend) as count
          FROM reviews GROUP BY product_id, id, recommend
      ) as s;`)
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function buildCharacteristicsCountTable() {
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS characteristics_count;');

  db
    .query(`
      SELECT product_id, name, characteristic_id, review_id, value
      INTO characteristics_count
      FROM (
        SELECT * FROM characteristics c
        LEFT JOIN characteristic_reviews cr
        ON c.id = cr.characteristic_id
      ) as s;`)
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function addProductIndex() {
  await db.connect();

  db
    .query('CREATE INDEX product_index ON reviews (product_id);')
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function addProductIndexChars() {
  await db.connect();

  await db
    .query('CREATE INDEX rec_product_index ON recommended (product_id);')
    .then((res) => console.log(res))
    .catch((e) => console.log(e));

  await db
    .query('CREATE INDEX ch_product_index ON characteristics_count (product_id);')
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function addReviewsIndexToPhotos() {
  await db.connect();

  db
    .query('CREATE INDEX photos_reviews_index ON photos (review_id);')
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function dropCharAndRecommendTables() {
  console.log('dropping tables');
  await db.connect();

  await db
    .query('DROP TABLE IF EXISTS characteristic_reviews, characteristics, recommended_count;')
    .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => db.end());
}

async function fullETL() {
  try {
    await reviewsETL();
    await photosETL();
    await charsETL();
    await charsReviewsETL();
    await buildRecommendTable();
    await buildCharacteristicsCountTable();
    await addProductIndex();
    await addProductIndexChars();
    await addReviewsIndexToPhotos();
    await dropCharAndRecommendTables();
  } catch (error) {
    console.log(error);
  }
}

module.exports = fullETL;
