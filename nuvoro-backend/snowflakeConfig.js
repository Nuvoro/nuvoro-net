const snowflake = require('snowflake-sdk');
require('dotenv').config(); // Load environment variables from .env file

// Create a Snowflake connection object
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

connection.connect((err, conn) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err);
  } else {
    console.log('Successfully connected to Snowflake:', conn.getId());
  }
});

module.exports = connection;
