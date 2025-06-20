var express = require('express');
var router = express.Router();

const mysql = require('mysql2/promise')
const database = mysql.createPool({
  host: '127.0.0.1', 
  user: 'root', 
  password: '123456', 
  database: 'DogWalkService', 
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/dogs', async function (req, res) {
  try {
    const query = 'select Users.username as owner_username, Dogs.name as dog_name, Dogs.size from Dogs left join Users on Dogs.owner_id = Users.user_id';
    const [rows] = await database.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString()});
  }
});

router.get('/api/walkrequests/open', async function (req, res) {
  try {
    const query = `select WalkRequests.request_id, Dogs.name as dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username as owner_username
    from WalkRequests 
    left join Dogs on WalkRequests.dog_id = Dogs.dog_id 
    left join Users on Dogs.owner_id = Users.user_id 
    where WalkRequests.status = 'open'`;
    const [rows] = await database.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString()});
  }
});

router.get('/api/walkers/summary', async function (req, res) {
  try {
    const query = `select Walker.username as walker_username, sum(WalkRatings.rating) as total_ratings, avg(WalkRatings.rating) as average_rating, count(WalkRequests.request_id) as completed_walks
    from (select user_id, username from Users where role = 'walker') Walker
    left join WalkRatings on Walker.user_id = WalkRatings.walker_id
    left join WalkApplications on Walker.user_id = WalkApplications.walker_id and WalkApplications.status = 'accepted'
    left join WalkRequests on WalkApplications.request_id = WalkRequests.request_id and WalkRequests.status = 'completed'
    GROUP BY Walker.user_id`;
    const [rows] = await database.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.toString()});
  }
});



module.exports = router;
