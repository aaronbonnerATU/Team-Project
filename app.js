let express = require('express');
let expressHandlebars = require('express-handlebars');
let qrcode = require("qrcode");
let { v4: uuidv4 } = require("uuid");

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

app.get('/book', function (req, res) {
    let filmID = req.query.film;
    let film;

    film = db.prepare("select * from films where filmid = ?").all(filmID);
    if (film.length === 0) {
        res.send("Error: Film not found.");
        return;
    }

    screenings = db.prepare("select * from screenings where filmid = ?").all(filmID);
    if (screenings.length === 0) {
        //res.send("Error: No screenings for this film.");
        //return;
    }

    //res.send(screenings);

    res.render("booking", film[0]);
});

app.get('/ticket', function (req, res) {
    let filmID = req.query.film;
    let film;

    film = db.prepare("select * from films where filmid = ?").all(filmID);
    if (film.length === 0) {
        res.redirect("/");
        return;
    }

    film = film[0];
    let ticketID = uuidv4();

    qrcode.toDataURL(ticketID).then(
        (qrData) => {
            film.qrData = qrData;
            film.date = "01-01-2022";
            //console.table(film);
            db.prepare("insert into tickets values (?,?)").run(Math.floor(Math.random()*1000000), ticketID);
            res.render("ticket", film);
        }).catch( 
            (err) => {
            console.log(err);
            res.redirect("/");    
        });
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
