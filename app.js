let express = require('express');
let expressHandlebars = require('express-handlebars');

const Database = require('better-sqlite3');
let db = new Database('filmDB.db', {verbose: console.log });
db.pragma('journal_mode = WAL');

let app = express();

let bodyParser = require("body-parser");
//app.use(bodyParser.urlencoded({ extended: false }));

app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static(__dirname + '/'));


//app.get('/', function (req, res) {
//    res.sendFile('./LOGIN.html');
//});

app.get('/', function (req, res) {
    res.render("home");
});

app.get('/films', function (req, res) {
    let rows = db.prepare("select * from films").all();
    console.table(rows);
    res.render("films", {films: rows});
});

app.post('/submit-login-data', function (req, res) {
   let name = req.body.username + ' ' + req.body.password;
    
    res.send(name + ' Submitted Successfully!');
});

let server = app.listen(5000, function () {
    console.log('Node server is running..');
});

