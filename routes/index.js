var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hi!');
});

/* Sync */
router.post('/auth', function(req, res, next) {

  var request = require('request');
  console.log(req.body);

  var options = {
    url: 'https://services.net-entreprises.fr/authentifier/1.0/',
    method: 'POST',
    headers: {
      'User-Agent': 'Client-DSN (DsnBuilder/12.5; Paie.fr)',
      'Content-Type' :'application/xml'
    },
    body: req.body
  };
 
function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    //var info = JSON.parse(body);
     res.status(200).send("Response : " + req.body);
  }else{
    res.status(400).send("Error : " + error);
  }
}
 
request(options, callback);

  
});

module.exports = router;
