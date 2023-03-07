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


app.get('/', function (req, res) {
    res.render("home");
});

app.get('/films', function (req, res) {
    let searchTerm = req.query.search;
    let rows;
    if (searchTerm === undefined) {
        rows = db.prepare("select * from films").all();
    } else {
        rows = db.prepare("select * from films where (title like '%'||?1||'%' or description like '%'||?1||'%' or year = ?1 or rating = ?1)").all({1: searchTerm});
    }
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

//Must be at the bottom; DONT MOVE THIS
app.use(express.static(__dirname + '/'));
