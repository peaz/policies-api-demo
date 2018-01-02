var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
//var usergrid = require('usergrid');
//var config = require('./config');

var app = express();
app.use(bodyParser.json());

app.get('/policies/:userId', function(req, res) {

  getPolicies(req.params.userId, (apiResponse) => {
    console.log("received: " + JSON.stringify(apiResponse));
    res.send(apiResponse);
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
    path: '/kenyc/sandbox/policies?ql=' + qlStr,
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
