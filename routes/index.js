var express = require('express');
var router = express.Router();
var http = require('https');

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
    body: "<identifiants> <siret>"+ req.body.siret+"</siret><nom>"+ req.body.nom+"</nom><prenom>"+ req.body.prenom+"</prenom><motdepasse>"+ req.body.motdepasse+"</motdepasse><service>"+ req.body.service+"</service></identifiants>"
    }, function (error, response, body){
      if(!error && response.statusCode == 200){
        console.log("jeton recu : ")
        console.log(response.body)
        res.status(200).send(response.body);
      }else{
        res.status(response.statusCode).send('error :' + error + ", message : " +response.statusMessage)
      }

    });
  
});

/* Send DSN */
router.post('/pushDsn', function(req, res, next) {
  //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var request = require('request');
  //var zip = require('lz-string');
  //var zip = require('lzjs');
  var zlib = require('zlib');
  console.log("Header Jeton : ")
  console.log(req.get('jeton'));
  console.log("File : ")
  console.log(req.body.file);
  zlib.gzip(req.body.file, function (err, result) { 
    request({
      url: 'https://depot.dsnrg.net-entreprises.fr/deposer-dsn/1.0/',
      method: "POST",
      gzip: true,
      headers: {
        'Authorization': 'DSNLogin jeton='+req.get('jeton'),
        'User-Agent': 'Client-DSN (DsnBuilder/12.5; Paie.fr)',
        'Content-Type' :'text/plain',
        'Cache-Control': 'no-cache',
        //'Content-Type' :'application/json',
        'Content-Encoding' :'gzip',
        'Accept-Encoding' :'gzip',
        //'Accept-Encoding' :'gzip',
        //'Content-Length' : 4096
      },
      body: result
      }, function (error, response, body){
        if(!error && response.statusCode == 200){
          console.log(response.statusCode)
          console.log(response.statusMessage)
          // console.log(zip.decompress(response.body))
          // res.status(200).send(zip.decompress(response.body));
         res.status(200).send(response.body);
        }else{
          console.log(response.statusCode)
          console.log(response.statusMessage)
          res.status(response.statusCode).send('error :' + error + ", message : " +response.statusMessage)
        }
      });
    });
});

/* Get retour */
router.get('/getReturn', function(req, res, next) {
  var request = require('request');
  console.log("Header flux : ")
  console.log(req.get('idFlux'))
  console.log("Header Jeton : ")
  console.log(req.get('jeton'))
  var status;
  var response;
  request({
    url: 'https://consultation.dsnrg.net-entreprises.fr/lister-retours-flux/1.0/'+req.get('idFlux'),
    method: "GET",
    gzip: true,
    headers: {
      'Authorization': 'DSNLogin jeton='+req.get('jeton'),
      'User-Agent': 'Client-DSN (DsnBuilder/12.5; Paie.fr)',
      // 'Content-Type' :'text/plain',
      'Accept-Encoding' : 'gzip'
    }
    }, function (error, response, body){
      if(!error && response.statusCode == 200){
        status = response.statusCode;
        response = response.statusMessage;
        console.log(response.statusCode);
        console.log(response.statusMessage);  
      }
    }).on('data', function(data) {
      status = 200;
      response = data;
      // decompressed data as it is received
      //console.log('decoded chunk: ' + data)
      console.log("status : ");
      console.log(status);
      console.log("response : ");
      console.log(response);
      res.status(status).send(response);
    }).on('response', function(response) {
      // unmodified http.IncomingMessage object
      console.log("response ? : " );
      console.log(response);
    });
});

module.exports = router;
