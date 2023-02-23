const db = require('../database');

async function getProduct(pid) {
  return db
    .query(`
      SELECT
        p.id, p.name, p.slogan, p.description, p.default_price, category, ARRAY_AGG(
          properties
        ) AS features
      FROM products p
      LEFT JOIN (
        SELECT product_id, jsonb_build_object('feature',feature, 'value',value) AS properties
        FROM features f
        WHERE product_id = ${pid}
      ) l
      ON p.id = l.product_id
      LEFT JOIN categories c
      ON p.category_id = c.id
      WHERE p.id = ${pid}
      GROUP BY p.id, p.name, p.slogan, p.description, p.default_price, category
    `)
    .then(({ rows }) => rows[0]);
}

async function getProducts(page = 1, count = 5) {
  return db
    .query(`
      SELECT
        products.id, products.name, products.slogan, products.description, products.default_price, categories.category
      FROM products
      LEFT JOIN categories
      ON products.category_id = categories.id
      ORDER BY products.id ASC
      LIMIT ${count} OFFSET ${count * (page - 1)}
    `)
    .then(({ rows }) => rows);
}

async function getRelatedProducts(pid) {
  return db
    .query(`
      SELECT related_product_id
      FROM related
      WHERE current_product_id = ${pid}
    `)
    .then(({ rows }) => rows.map((row) => row.related_product_id));
}

async function getProductStyles(pid) {
  return db
    .query(`
      SELECT s.product_id, ARRAY_AGG(
        jsonb_build_object(
          'style_id', s.style_id,
          'name', s.name,
          'original_price', s.original_price,
          'sale_price', s.sale_price,
          'default', s.default_style,
          'photos', parr,
          'skus', skusobj
        )
      ) results
      FROM styles s
      LEFT JOIN (
        SELECT ph.style_id, ARRAY_AGG(
          jsonb_build_object(
            'url', ph.url,
            'thumbnail_url', ph.thumbnail_url
          )
        ) AS parr
        FROM photos ph
        GROUP BY ph.style_id
      ) flj ON flj.style_id = s.style_id
      LEFT JOIN (
        SELECT sk.style_id, jsonb_object_agg(
          sk.id,
          jsonb_build_object(
            'quantity', sk.quantity,
            'size', sk.size
          )
        ) AS skusobj
        FROM skus sk
        GROUP BY sk.style_id
      ) slj ON slj.style_id = s.style_id
      WHERE s.product_id = ${pid}
      GROUP BY s.product_id
    `)
    .then(({ rows }) => rows[0]);
}

module.exports.getProduct = getProduct;
module.exports.getProducts = getProducts;
module.exports.getRelatedProducts = getRelatedProducts;
module.exports.getProductStyles = getProductStyles;
