const express = require('express');
const {
  getProduct, getProducts, getRelatedProducts, getProductStyles
} = require('./productsRouteQueries');

const router = express.Router();

// ----- Products - Routes ----- //

router.get('/', (req, res) => {
  getProducts(req.params.page, req.params.count)
    .then((data) => {
      res.status(200);
      res.send(data);
      res.end();
    })
    .catch(() => res.send('Failed to get products'));
});

router.get('/:id/related', (req, res) => {
  getRelatedProducts(req.params.id)
    .then((data) => {
      res.status(200);
      res.send(data);
      res.end();
    })
    .catch(() => res.send('Failed to get related products'));
});

router.get('/:id/styles', (req, res) => {
  getProductStyles(req.params.id)
    .then((data) => {
      res.status(200);
      res.send(data);
      res.end();
    })
    .catch(() => res.send('Failed to get styles'));
});

router.get('/:id/', (req, res) => {
  getProduct(req.params.id)
    .then((data) => {
      res.status(200);
      res.send(data);
      res.end();
    })
    .catch(() => res.send('Failed to get product'));
});

module.exports = router;
