var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hi!');
});

/* Sync */
router.post('/auth', function(req, res, next) {

  var request = require('request');
  console.log(req.body)
  res.status(200).send(req.body);

  request({
    url: 'https://services.net-entreprises.fr/authentifier/1.0/',
    method: "POST",
    headers: {
      'User-Agent': 'Client-DSN (DsnBuilder/12.5; Paie.fr)',
      'Content-Type' :'application/xml'
    },
    body: "<identifiants> <siret>"+ req.body.identifiants.siret+"</siret><nom>"+ req.body.identifiants.nom+"</nom><prenom>"+ req.body.identifiants.prenom+"</prenom><motdepasse>"+ req.body.identifiants.motdepasse+"</motdepasse><service>"+ req.body.identifiants.service+"</service></identifiants>"
    }, function (error, response, body){
      if(!error){
        res.status(200).send(response.body);
      }else{
        res.status(400).send('error :' + error)
      }

    });
  
});

module.exports = router;
