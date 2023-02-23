const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Sdc',
  password: 'postpass',
  port: '5432',
});

async function answerPhotosEtl() {
  await client.connect();

  client
    .query(`CREATE TABLE IF NOT EXISTS answerPhotos (
  id serial PRIMARY KEY,
  answer_id integer REFERENCES answers(id),
  url varchar(255)
)`)
    .then(() => {
      client
        .query(`
      COPY answerPhotos(id, answer_id, url)
        FROM '${path.join('/private/tmp/answers_photos.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
        .then((res) => console.log(res))
        .catch((e) => console.log(e))
        .finally(() => client.end());
    })
    .catch((e) => console.log(e));
}

answerPhotosEtl();
