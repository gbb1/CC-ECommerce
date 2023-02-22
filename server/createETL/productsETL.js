const db = require('../database');

const dataPath = '../../Data/';

async function buildTables() {
  db
    .query(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name VARCHAR (30) NOT NULL,
        slogan VARCHAR (256) NOT NULL,
        description VARCHAR (512) NOT NULL,
        category VARCHAR (20) NOT NULL,
        default_price VARCHAR (10) NOT NULL
      )`)
    .then(() => db.query(`
      COPY products(id, name, slogan, description, category, default_price)
        FROM '${path.join(__dirname, dataPath + 'product.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    .then(() => db.query(`
      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY,
        product_id INTEGER
          REFERENCES products(id),
        feature VARCHAR (24) NOT NULL,
        value VARCHAR (30)
    )`))
    .then(() => db.query(`
      COPY features(id, product_id, feature, value)
        FROM '${path.join(__dirname, dataPath + 'features.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    .then(() => db.query(`
      CREATE TABLE IF NOT EXISTS styles (
        style_id INTEGER PRIMARY KEY,
        product_id INTEGER
          REFERENCES products(id),
        name VARCHAR (30),
        sale_price VARCHAR (10),
        original_price VARCHAR (10),
        default_style BOOLEAN
    )`))
    .then(() => db.query(`
      COPY styles(id, product_id, name, sale_price, original_price, default_style)
        FROM '${path.join(__dirname, dataPath + 'styles.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    .then(() => db.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY,
        style_id INTEGER NOT NULL
          REFERENCES styles(id),
        url VARCHAR (155),
        thumbnail_url VARCHAR (155)
    )`))
    .then(() => db.query(`
      COPY photos(id, style_id, url, thumbnail_url)
        FROM '${path.join(__dirname, dataPath + 'photos.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    .then(() => db.query(`
      CREATE TABLE IF NOT EXISTS skus (
        id INTEGER PRIMARY KEY,
        style_id INTEGER NOT NULL
          REFERENCES styles(id),
        size VARCHAR (10),
        quantity INTEGER
    )`))
    .then(() => db.query(`
      COPY skus(id, style_id, size, quantity)
        FROM '${path.join(__dirname, dataPath + 'skus.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    .then(() => db.query(`
      CREATE TABLE IF NOT EXISTS related (
        id INTEGER PRIMARY KEY,
        current_product_id INTEGER NOT NULL
          REFERENCES products(id),
        related_product_id INTEGER NOT NULL
          REFERENCES products(id)
    )`))
    .then(() => db.query(`
      COPY related(id, current_product_id, related_product_id)
        FROM '${path.join(__dirname, dataPath + 'related.csv')}'
        DELIMITER ','
        CSV HEADER
        NULL '0'
        WHERE current_product_id IS NOT NULL AND related_product_id IS NOT NULL
    `))
    .then(() => db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category VARCHAR (20) NOT NULL
      )
    `))
    .then(() => db.query(`
      INSERT INTO categories(category)
      (
        SELECT DISTINCT category
        FROM products
      )
    `))
    .then(() => db.query(`
      ALTER TABLE products
      ADD COLUMN category_id INTEGER
      REFERENCES categories(id)
    `))
    .then(() => db.query(`
        UPDATE products
        SET category_id = categories.id
        FROM categories
        WHERE products.category = categories.category
    `))
    .then(() => db.query(`
        ALTER TABLE products
        DROP COLUMN category
    `));
    .catch((err) => console.log('err: ', err));
}

async function makeIndexes() {
  db
  .query(`
    CREATE INDEX idx_feats_product_id
    ON features(product_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on features'));
  db
  .query(`
    CREATE INDEX idx_styles_product_id
    ON styles(product_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on styles'));
  db
  .query(`
    CREATE INDEX idx_curr_product_id
    ON related(current_product_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on related products'));
  db
  .query(`
    CREATE INDEX idx_photos_style_id
    ON photos(style_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on photos'));
  db
  .query(`
    CREATE INDEX idx_skus_style_id
    ON skus(style_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on skus'));
}

await buildTables();
await makeIndexes();
