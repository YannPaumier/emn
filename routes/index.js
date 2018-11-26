var express = require('express');
var router = express.Router();
var http = require('https');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hi!');
});

/* Catching HOOKS from Yousign */
router.get('/hooks', function(req, res, next) {
  var id = req.get('id');
  console.log(id)

  /*
   * GET TOKEN
   */
  var options = {
  method: 'POST',
  url: 'https://cs81.salesforce.com/services/oauth2/token',
  headers: 
   { 'cache-control': 'no-cache',
     'content-type': 'multipart/form-data;' },
  formData: 
   { grant_type: 'password',
     client_id: '3MVG9od6vNol.eBid0tcZtL6VEWzedFKxaeXsfQUpUcf.9lwW8tLvmCgo57dqAEkpvon_SPGA44U8OTIXCzXv',
     client_secret: '4542172518864976311',
     username: 'yannpaumier@gmail.com',
     password: 'Yann2018PTjGD3swk2d4UwcmMruxmMib' } 
    };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
    var jsonBody = JSON.parse(body);
    var token = jsonBody.access_token;
    console.log("token : " + token)

    /* 
     * UPDATE
     */
    var options = { method: 'PATCH',
    url: 'https://cs81.salesforce.com/services/data/v32.0/sobjects/Yousign_procedure__c/'+id,
    headers: 
    { 'cache-control': 'no-cache',
      'Content-Type': 'application/json',
      Authorization: 'Bearer '+token },
    body: { 
      webhook_yousign__c: 'procedure.finished'
    },
    json: true };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
  });

  res.status(200).send('We are catching hooks form there. with the id : ' + id);
});


/* Sync */
router.post('/auth', function(req, res, next) {

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
       // ??
      }
    }).on('data', function(data) {
      res.status(200).send(data);
    }).on('response', function(response) {
      // unmodified http.IncomingMessage object
      console.log("response ? : " );
      console.log(response.statusCode);
      console.log(response.statusMessage);  
      if(!response.statusCode == 200){
        res.status(response.statusCode).send(response.statusMessage);
      }
    });
});

module.exports = router;
