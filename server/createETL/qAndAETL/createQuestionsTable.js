const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Sdc',
  password: 'postpass',
  port: '5432',
});

async function questionsEtl() {
  await client.connect();

  client
    .query(`CREATE TABLE IF NOT EXISTS questions (
  question_id serial PRIMARY KEY,
  product_id integer,
  question_body text,
  question_date varchar(255),
  asker_name varchar(255),
  asker_email varchar(255),
  question_helpfulness integer,
  reported integer)`)
    .then(() => {
      client
        .query(`
      COPY questions(question_id, product_id, question_body, question_date, asker_name, asker_email, question_helpfulness, reported)
        FROM '${path.join('/private/tmp/questions.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
        .then((res) => console.log(res))
        .catch((e) => console.log(e))
        .finally(() => client.end());
    })
    .catch((e) => console.log(e));
}

questionsEtl();
