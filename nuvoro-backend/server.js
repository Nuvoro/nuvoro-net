const express = require('express');
const admin = require('firebase-admin');
const snowflake = require('snowflake-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main HTML file for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Snowflake connection setup
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
    process.exit(1);
  } else {
    console.log('Successfully connected to Snowflake');
  }
});

// Function to ensure Snowflake connection
function ensureSnowflakeConnection() {
  return new Promise((resolve, reject) => {
    if (connection.isUp()) {
      resolve();
    } else {
      connection.connect((err, conn) => {
        if (err) {
          reject('Unable to connect to Snowflake: ' + err.message);
        } else {
          resolve(conn);
        }
      });
    }
  });
}

// Endpoint to handle user info insertion
app.post('/api/user-info', async (req, res) => {
  const { uid, firstName, lastName, email } = req.body;

  try {
    await ensureSnowflakeConnection();

    const query = `INSERT INTO NUVORO_SHARED_DB.MAIN_SCHEMA.USERS (ID, FIRST_NAME, LAST_NAME, EMAIL) VALUES ('${uid}', '${firstName}', '${lastName}', '${email}')`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to insert data:', err);
          return res.status(500).json({ success: false, message: 'Failed to insert data', error: err.message });
        } else {
          console.log('User data inserted successfully');
          return res.status(200).json({ success: true, message: 'User data inserted successfully' });
        }
      }
    });
  } catch (error) {
    console.error('Error inserting user data:', error);
    return res.status(500).json({ success: false, message: 'Failed to insert user data', error: error.message });
  }
});

// Endpoint to handle data insertion
app.post('/api/insert', async (req, res) => {
  const { id, firstName, lastName, email } = req.body;

  try {
    await ensureSnowflakeConnection();

    const query = `INSERT INTO NUVORO_SHARED_DB.MAIN_SCHEMA.USERS (ID, FIRST_NAME, LAST_NAME, EMAIL) VALUES ('${id}', '${firstName}', '${lastName}', '${email}')`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to insert data:', err);
          return res.status(500).json({ success: false, message: 'Failed to insert data' });
        } else {
          console.log('Data inserted successfully');
          return res.status(200).json({ success: true, message: 'Data inserted successfully' });
        }
      }
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    return res.status(500).json({ success: false, message: 'Failed to insert data' });
  }
});

// Endpoint to fetch user data
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await ensureSnowflakeConnection();

    const query = `SELECT * FROM NUVORO_SHARED_DB.MAIN_SCHEMA.USERS WHERE ID = '${userId}'`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to fetch data:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch data' });
        } else {
          if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
          } else {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// Endpoint to update user data
app.put('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email } = req.body;

  try {
    await ensureSnowflakeConnection();

    const query = `UPDATE NUVORO_SHARED_DB.MAIN_SCHEMA.USERS SET FIRST_NAME = '${firstName}', LAST_NAME = '${lastName}', EMAIL = '${email}' WHERE ID = '${userId}'`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to update data:', err);
          return res.status(500).json({ success: false, message: 'Failed to update data' });
        } else {
          return res.status(200).json({ success: true, message: 'Data updated successfully' });
        }
      }
    });
  } catch (error) {
    console.error('Error updating data:', error);
    return res.status(500).json({ success: false, message: 'Failed to update data' });
  }
});

// Endpoint to handle fetching user data with query parameter
app.get('/api/user-info', async (req, res) => {
  const userId = req.query.uid;

  try {
    await ensureSnowflakeConnection();

    const query = `SELECT * FROM NUVORO_SHARED_DB.MAIN_SCHEMA.USERS WHERE ID = '${userId}'`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to fetch data:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch data' });
        } else {
          if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows[0] });
          } else {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// Endpoint to fetch user key by Firebase UID
app.get('/api/user-key', async (req, res) => {
  const userId = req.query.uid;

  try {
    await ensureSnowflakeConnection();

    const query = `SELECT USER_KEY FROM NUVORO_SHARED_DB.MAIN_SCHEMA.USERS WHERE ID = '${userId}'`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to fetch user key:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch user key' });
        } else {
          if (rows.length > 0) {
            return res.status(200).json({ success: true, userKey: rows[0].USER_KEY });
          } else {
            return res.status(404).json({ success: false, message: 'User not found' });
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user key:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user key' });
  }
});

// Endpoint to handle service creation
app.post('/api/add-service', async (req, res) => {
  const { userKey, serviceName, serviceDescription, serviceCost } = req.body;

  try {
    await ensureSnowflakeConnection();

    const serviceId = generateUniqueId();
    const dateCreated = new Date().toISOString();

    const query = `
      INSERT INTO NUVORO_SHARED_DB.MAIN_SCHEMA.SERVICES (
        SERVICE_ID, ID, SERVICE_NAME, SERVICE_DESCRIPTION, SERVICE_COST, DATE_CREATED, IS_DELETED
      ) VALUES (
        '${serviceId}', '${userKey}', '${serviceName}', '${serviceDescription}', ${serviceCost}, '${dateCreated}', false
      )
    `;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to insert service:', err);
          return res.status(500).json({ success: false, message: 'Failed to insert service', error: err.message });
        } else {
          console.log('Service added successfully');
          return res.status(200).json({ success: true, message: 'Service added successfully' });
        }
      }
    });
  } catch (error) {
    console.error('Error inserting service:', error);
    return res.status(500).json({ success: false, message: 'Failed to insert service', error: error.message });
  }
});

// Endpoint to fetch services
app.get('/api/services', async (req, res) => {
  const userKey = req.query.userKey;

  try {
    await ensureSnowflakeConnection();

    const query = `SELECT * FROM NUVORO_SHARED_DB.MAIN_SCHEMA.SERVICES WHERE ID = '${userKey}' AND IS_DELETED = false`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to fetch services:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch services' });
        } else {
          return res.status(200).json(rows);
        }
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Endpoint to delete a service
app.delete('/api/delete-service/:serviceId', async (req, res) => {
  const serviceId = req.params.serviceId;

  try {
    await ensureSnowflakeConnection();

    const query = `UPDATE NUVORO_SHARED_DB.MAIN_SCHEMA.SERVICES SET IS_DELETED = true WHERE SERVICE_ID = '${serviceId}'`;

    connection.execute({
      sqlText: query,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to delete service:', err);
          return res.status(500).json({ success: false, message: 'Failed to delete service', error: err.message });
        } else {
          console.log('Service deleted successfully');
          return res.status(200).json({ success: true, message: 'Service deleted successfully' });
        }
      }
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete service', error: error.message });
  }
});

// Helper function to generate a unique ID
function generateUniqueId() {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function() {
    return (Math.random() * 16 | 0).toString(16);
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
