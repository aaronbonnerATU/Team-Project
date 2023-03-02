let express = require('express');
let app = express();

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile('LOGIN.html');
});

app.post('/submit-login-data', function (req, res) {
   let name = req.body.username + ' ' + req.body.password;
    
    res.send(name + ' Submitted Successfully!');
});

let server = app.listen(5000, function () {
    console.log('Node server is running..');
});

