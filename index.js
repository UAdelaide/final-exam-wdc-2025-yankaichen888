var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });



    // Insert data if table is empty
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES ('alice123', 'alice@example.com', 'hashed123', 'owner');
      `);
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES ('bobwalker', 'bob@example.com', 'hashed456', 'walker');
      `);
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES ('carol123', 'carol@example.com', 'hashed789', 'owner');
      `);
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES ('user4', 'user4@example.com', 'hasheduser4', 'owner');
      `);
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES ('user5', 'user5@example.com', 'hasheduser5', 'owner');
      `);

      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='alice123'), 'Max', 'medium');
      `);
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='carol123'), 'Bella', 'small');
      `);
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='user4'), 'dog3', 'small');
      `);
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='alice123'), 'dog4', 'small');
      `);
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES ((select user_id from Users where username='user5'), 'dog5', 'small');
      `);

      await db.execute(`
        INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Max'), '2025-06-10 08:00:00', 30, 'Parkdands', 'open');
      `);
      await db.execute(`
        INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Bella'), '2025-06-10 09:30:00', 30, 'Beachside Ave', 'accepted');
      `);
      await db.execute(`
        INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Max'), '2025-06-11 08:00:00', 30, 'Parkdands', 'open');
      `);
      await db.execute(`
        INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='Max'), '2025-06-12 08:00:00', 30, 'Parkdands', 'open');
      `);
      await db.execute(`
        INSERT INTO WalkRequests (dog_id,requested_time,duration_minutes, location,status) VALUES ((select dog_id from Dogs where name='dog4'), '2025-06-10 08:00:00', 30, 'Parkdands', 'open');    
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();


app.get('/api/dogs', async function (req, res) {
  try {
    const query = 'select Users.username as owner_username, Dogs.name as dog_name, Dogs.size from Dogs left join Users on Dogs.owner_id = Users.user_id';
    const [rows] = await db.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString()});
  }
});


app.get('/api/walkrequests/open', async function (req, res) {
  try {
    const query = `select WalkRequests.request_id, Dogs.name as dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username as owner_username
    from WalkRequests 
    left join Dogs on WalkRequests.dog_id = Dogs.dog_id 
    left join Users on Dogs.owner_id = Users.user_id 
    where WalkRequests.status = 'open'`;
    const [rows] = await db.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString()});
  }
});



app.get('/api/walkers/summary', async function (req, res) {
  try {
    const query = `select Walker.username as walker_username, sum(WalkRatings.rating) as total_ratings, avg(WalkRatings.rating) as average_rating, count(WalkRequests.request_id) as completed_walks
    from (select user_id, username from Users where role = 'walker') Walker
    left join WalkRatings on Walker.user_id = WalkRatings.walker_id
    left join WalkApplications on Walker.user_id = WalkApplications.walker_id and WalkApplications.status = 'accepted'
    left join WalkRequests on WalkApplications.request_id = WalkRequests.request_id and WalkRequests.status = 'completed'
    GROUP BY Walker.user_id`;
    const [rows] = await db.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString()});
  }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
