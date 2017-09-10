var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
//var usergrid = require('usergrid');
//var config = require('./config');

var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
//app.get('/', express.static(__dirname + '/public'));

app.get('/policies/:userId', function(req, res) {

  getPolicies(req.params.userId, (apiResponse) => {
    console.log(apiResponse.length);
    var payload = new Object();
    payload = [];
    for (var i=0; i<apiResponse.length; i++ ) {
      var policy = {
        "country" : apiResponse[i].country,
        "endDate" : apiResponse[i].endDate,
        "policyNo" : apiResponse[i].policyId,
        "price" : apiResponse[i].price,
        "startDate" : apiResponse[i].startDate,
        "userId" : apiResponse[i].userId
      };
      payload.push(policy);
    }
    console.log("received: " + JSON.stringify(apiResponse));
    console.log("payload: " + JSON.stringify(payload));

    res.send(payload);
  })
});

app.post('/policies', function(req, res) {
  var payload = req.body;
  var policyNo = generatePolicyNumber();
  var policy = {
    "name" : payload.userId + " - " + policyNo,
    "country" : payload.country,
    "endDate" : payload.endDate,
    "policyId" : policyNo,
    "price" : payload.price,
    "startDate" : payload.startDate,
    "userId" : payload.userId
  };
  console.log("policy: " + JSON.stringify(policy));

  submitPolicy(policy, (apiResponse) => {
    var resPayload = {
      "country" : apiResponse.entities[0].country,
      "endDate" : apiResponse.entities[0].endDate,
      "policyNo" : apiResponse.entities[0].policyId,
      "price" : apiResponse.entities[0].price,
      "startDate" : apiResponse.entities[0].startDate,
      "userId" : apiResponse.entities[0].userId
    };
    console.log("received: " + JSON.stringify(apiResponse));
    console.log("resPayload: " + JSON.stringify(resPayload));

    res.send(resPayload);
  })
});


// Listen for requests until the server is stopped
app.listen(process.env.PORT || 9000);
console.log('The server is running!');


function getPolicies(userId, callback) {
  var qlStr = "select%20*%20where%20userId%20=%20'" + userId + "'";
  var options = {
    host: 'apibaas-trial.apigee.net',
    port: 443,
    path: '/kentrial/sandbox/policies?ql=' + qlStr,
    method: 'GET'
  };
  var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
            var pop = JSON.parse(returnData).entities;
            callback(pop);
        });
    });
    req.end();
}

function submitPolicy(policy, callback) {
  var options = {
    host: 'apibaas-trial.apigee.net',
    port: 443,
    path: '/kentrial/sandbox/policies',
    method: 'POST'
  };
  var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
            var pop = JSON.parse(returnData);
            callback(pop);
        });
    });
    req.write(JSON.stringify(policy));
    req.end();
}

function generatePolicyNumber() {
    var text = "";
    var length = 8;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  return "P-" + text;
}
