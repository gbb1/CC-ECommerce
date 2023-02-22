const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Sdc',
  password: 'postpass',
  port: '5432',
});

async function connectClient() {
  await client.connect();
  console.log('connected to database');
}

async function closeClient() {
  await client.close();
  console.log('closed connection to database');
}

module.exports = { client, connectClient, closeClient };
