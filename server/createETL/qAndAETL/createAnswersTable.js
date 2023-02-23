const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Sdc',
  password: 'postpass',
  port: '5432',
});

async function answersEtl() {
  await client.connect();

  client
    .query(`CREATE TABLE IF NOT EXISTS answers (
  id serial PRIMARY KEY,
  question_id integer REFERENCES questions(question_id),
  answer_body text,
  answer_date varchar(255),
  answerer_name varchar(255),
  answerer_email varchar(255),
  reported integer,
  answer_helpfulness integer
)`)
    .then(() => {
      client
        .query(`
      COPY answers(id, question_id, answer_body, answer_date, answerer_name, answerer_email, reported, answer_helpfulness)
        FROM '${path.join('/private/tmp/answers.csv')}'
        DELIMITER ','
        CSV HEADER
    `)
        .then((res) => console.log(res))
        .catch((e) => console.log(e))
        .finally(() => client.end());
    })
    .catch((e) => console.log(e));
}

answersEtl();
