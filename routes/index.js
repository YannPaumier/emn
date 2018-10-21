var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hi!');
});

/* Sync */
router.post('/auth', function(req, res, next) {
  res.status(200).send("Response : " + req.body);
});

module.exports = router;
