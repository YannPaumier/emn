var express = require('express');
var router = express.Router();
var http = require('http');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hi!');
});

/* Sync */
router.post('/auth', function(req, res, next) {

  var request = require('request');
  console.log(req.body)

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

/* Send DSN */
router.post('/pushDsn', function(req, res, next) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var request = require('request');
  //var zip = require('lz-string');
  var zip = require('lzjs');
  
  //console.log(req.body.jeton);
  //var compressed = zip.compress(req.body.file)
  var compressed = zip.compress(req.body.file)
  //console.log(compressed)
  //console.log(zip.decompress(compressed))


  var req2 = http.request({
    "host": "dsnrg.net-entreprises.fr",
    "port": null,
    "method": "POST",
    "path": "/deposer-dsn/1.0/",
    "headers": {
      'Authorization': 'DSNLogin jeton='+req.body.jeton,
      'User-Agent': 'Client-DSN (DsnBuilder/12.5; Paie.fr)',
      'Content-Type' :'text/plain',
      'Cache-Control': 'no-cache',
      //'Content-Type' :'application/json',
      'Content-Encoding' :'gzip',
      'Accept-Encoding' :'gzip',
      //'Accept-Encoding' :'gzip',
      //'Content-Length' : 4096
    },
    }, function(res) {
    var body = "";
    res.on("data", function(chunk) {
      body += chunk;
      console.log(body)
    });

    res.on("end", function() {
      if (res.statusCode !== 200) {
      console.error("Bad status code received: " + res.statusCode + " Message : " + res.statusMessage);
      } else {
      console.log("Posting OK");
      }
      });
    });

    req2.on("error", function(e) {
      console.error("Error posting data: " + e.message);
    });

    req2.write(req.body.file);
    req2.end();

  // request({
  //   url: 'https://depot.dsnrg.net-entreprises.fr/deposer-dsn/1.0/',
  //   method: "POST",
  //   gzip: true,
  //   headers: {
  //     'Authorization': 'DSNLogin jeton='+req.body.jeton,
  //     'User-Agent': 'Client-DSN (DsnBuilder/12.5; Paie.fr)',
  //     'Content-Type' :'text/plain',
  //     'Cache-Control': 'no-cache',
  //     //'Content-Type' :'application/json',
  //     'Content-Encoding' :'gzip',
  //     'Accept-Encoding' :'gzip',
  //     //'Accept-Encoding' :'gzip',
  //     //'Content-Length' : 4096
  //   },
  //   body: compressed
  //   }, function (error, response, body){
  //     if(!error){
  //       console.log(response.statusCode)
  //       console.log(response.statusMessage)
  //       console.log(zip.decompress(response.body))
  //      // res.status(200).send(zip.decompress(response.body));
  //      res.status(200).send(response.body);
  //     }else{
  //       res.status(400).send('error :' + error)
  //     }

  //   });
  
});

module.exports = router;
