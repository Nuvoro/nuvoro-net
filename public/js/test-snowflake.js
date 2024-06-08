const snowflake = require('snowflake-sdk');

const connection = snowflake.createConnection({
  account: 'erarlim-vk63918',
  username: 'NUVORO',
  password: 'Nuvoro2DAm@@n',
  warehouse: 'MAIN_WH',
  database: 'NUVORO_SHARED_DB',
  schema: 'MAIN_SCHEMA'
});

connection.connect((err, conn) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err.message);
  } else {
    console.log('Successfully connected to Snowflake');
    const query = `INSERT INTO NUVORO_SHARED_DB.MAIN_SCHEMA.USERS (ID, NAME, AGE) VALUES ('1', 'John Doe', 30)`;

    conn.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to insert data:', err);
        } else {
          console.log('Data inserted successfully');
        }
        connection.destroy();
      }
    });
  }
});
