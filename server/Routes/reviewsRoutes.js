/* eslint-disable prefer-const */
/* eslint-disable camelcase */
const express = require('express');
const db = require('../database');

const router = express.Router();

// ----- QUERYING DB ----- //
router.get('/', (req, res) => {
  // console.log('getting request for reviews data');
  console.log(req.query);
  const sort = {
    newest: 'date',
    helpful: 'helpful',
    relevant: 'relevant',
  };

  if (req.query.count === undefined) {
    req.query.count = 5;
  }

  if (req.query.page === undefined) {
    req.query.page = 0;
  }

  db.query(`
    SELECT product_id, r.id, rating, summary, body, to_timestamp(date::bigint)::date as date, recommend, reviewer_name, reviewer_email,
    reported, response, helpfulness, array_remove(array_agg(photos), NULL) as photos
      FROM
      (SELECT * FROM reviews WHERE product_id IN ($1) AND reported = 'false') r
        LEFT JOIN
        (
        SELECT review_id, jsonb_build_object(photos.id, url) as photos
          FROM photos
          WHERE review_id IN (SELECT id FROM reviews WHERE product_id IN ($2))
          GROUP BY review_id, photos.id, url
        ) p
        ON r.id = p.review_id
      GROUP BY  product_id, r.id, rating, summary, body, date, recommend, reviewer_name,
        reviewer_email, reported, response, helpfulness
      ORDER BY $3 DESC
      LIMIT $4 OFFSET $5;
  `, [req.query.product_id,
    req.query.product_id,
    sort[req.query.sort],
    req.query.count,
    req.query.page], (err, results) => {
    res.send(
      {
        product: req.query.product_id,
        page: req.query.page,
        count: req.query.count,
        results: results.rows,
      },
      // results.rows
    );
  });
});

router.get('/meta', (req, res) => {
  // console.log('getting request for reviews meta');
  const id = req.query.product_id;

  db.query(`
  SELECT a.product_id, recommended, characteristics, ratings FROM
    (
      SELECT rec.product_id, recommended, characteristics  FROM
      (
        SELECT product_id, jsonb_object_agg(recommend, count) as recommended FROM
        (
          SELECT product_id, recommend, sum(count) as count
          FROM recommended
          WHERE product_id IN ($1)
          GROUP BY product_id, recommend
        ) s
        GROUP BY product_id
      ) rec
      LEFT JOIN
      (
        SELECT s.product_id, jsonb_object_agg(name, characteristics) as characteristics
        FROM
        (
          SELECT product_id, name, jsonb_build_object('id', characteristic_id, 'value', AVG(value))
            as characteristics
          FROM characteristics_count
          WHERE product_id IN ($2)
          GROUP BY product_id, characteristic_id, name) s
          GROUP BY s.product_id) char
          ON rec.product_id = char.product_id
        ) a
      LEFT JOIN
        (
          SELECT product_id, jsonb_object_agg(rating, count) as ratings FROM
          (
            SELECT product_id, rating, COUNT(rating) as count
            FROM reviews WHERE product_id IN ($3)
            GROUP BY product_id, rating) rat
          GROUP BY product_id
        ) b
  ON a.product_id = b.product_id;
  `, [id, id, id], (err, result) => {
    console.log(err, result.rows, result.rows[0]);
    res.send(result.rows[0]);
  });
});

// ----- ADDING TO DB ----- //
router.put('/:review_id/helpful', (req, res) => {
  const { review_id } = req.body;
  // console.log('marking helpful', review_id);

  db.query(`
    UPDATE reviews
    SET helpfulness = helpfulness + 1
    WHERE id = ${Number(review_id)};
  `, (err, result) => {
    if (err) {
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

router.put('/:review_id/report', (req, res) => {
  // console.log('reporting');
  const { review_id } = req.body;

  db.query(`
    UPDATE reviews
    SET reported = true
    WHERE id = ${Number(review_id)};
  `, (err, result) => {
    if (err) {
      res.status(500).send();
    } else {
      res.status(204).send();
    }
  });
});

router.post('/', (req, res) => {
  const date = Math.floor(new Date().getTime() / 1000).toString();
  let {
    photos, product_id, rating, summary, body,
    recommend, reviewer_name, reviewer_email,
  } = req.body;
  photos = `'{${JSON.stringify(photos).slice(2, -2)}}'`;

  db.query(`
    BEGIN;

    INSERT INTO recommended (product_id, recommend, count)
    VALUES (${Number(product_id)}, ${recommend}, ${1});

    INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, date, helpfulness, reported)
    VALUES (
      ${Number(product_id)},
      ${Number(rating)},
      ${String(summary)},
      ${String(body)},
      ${String(recommend)},
      ${reviewer_name},
      ${reviewer_email},
      ${date},
      0,
      'false'
      )
    RETURNING id;

    INSERT INTO photos (review_id, url)
    VALUES (
    (SELECT MAX(id) FROM reviews WHERE product_id IN (${Number(product_id)})),
    unnest(${photos}::text[]));

    COMMIT;
  `, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send('CREATED');
    }
  });
});

module.exports = router;
