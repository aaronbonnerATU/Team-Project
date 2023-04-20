let express = require('express');
let expressHandlebars = require('express-handlebars');
let qrcode = require("qrcode");
let { v4: uuidv4 } = require("uuid");

const Database = require('better-sqlite3');
let db = new Database('filmDB.db', {verbose: console.log });
db.pragma('journal_mode = WAL');


let app = express();

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('handlebars', expressHandlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


app.get('/', function (req, res) {
    res.render("home");
});

app.get('/comingsoon', function (req, res) {
    res.render("comingsoon");
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

app.get('/contact', function (req, res) {

    res.render("contact");

});

app.get('/screenings', function (req, res) {
    let film = req.query.film;
    console.log(film);
    let rows = [];
    if (film !== undefined) {
        rows = db.prepare("select title, showtime, (rooms.capacity - screenings.seatsBooked), screeningID as placesLeft, rooms.roomID, screeningID from films, screenings, rooms where screenings.filmID = films.filmID and films.filmID = ? and screenings.roomID = rooms.roomID and screenings.seatsBooked < rooms.capacity order by showtime;").all(film);
    } else {
        rows = db.prepare("select title, showtime, (rooms.capacity - screenings.seatsBooked), screeningID as placesLeft, rooms.roomID, screeningID from films, screenings, rooms where screenings.filmID = films.filmID and screenings.roomID = rooms.roomID order by films.filmID order by showtime").all();

    }

    console.table(rows);

    res.render("viewscreening", {screenings: rows});
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
    let screeningID = req.query.screening;
    let screening;

    screening = db.prepare("select title, rating, showtime from screenings, films where screeningID = ? and screenings.filmID = films.filmID").all(screeningID);
    if (screening.length === 0) {
        res.redirect("/");
        return;
    }

    screening = screening[0];
    let ticketID = uuidv4();

    qrcode.toDataURL(ticketID).then(
        (qrData) => {
            screening.qrData = qrData;
            screening.date = "01-01-2022";
            //console.table(film);
            db.prepare("insert into tickets values (?,?)").run(ticketID,screeningID);
            db.prepare("update screenings set seatsBooked=(seatsBooked+1) where screeningID = ?").run(screeningID);
            res.render("ticket", screening);
        }).catch( 
            (err) => {
            console.log(err);
            res.redirect("/");    
        });
});

app.get('/payment', function(req, res){
    let screeningID = req.query.screening;
    let screening;

    screening = db.prepare("select films.filmID, screeningID, title, rating, showtime, description, poster from screenings, films where screeningID = ? and screenings.filmID = films.filmID").all(screeningID);
    if (screening.length === 0) {
        res.redirect("/");
        return;
    }

    screening = screening[0];

    res.render("payment", screening);
});

app.post('/submit-login-data', function (req, res) {
    let name = req.body.username + ' ' + req.body.password;
    
    res.send(name + ' Submitted Successfully!');
});

//-------------------------------------------
//code for admin panel
app.post('/add-new-movie', function(req, res){
    let lastRow = db.prepare("SELECT * FROM films ORDER BY filmID DESC LIMIT 1").all()
    let filmID = 0;
    if (lastRow.length > 0) {
        filmID = 1 + lastRow[0].filmID;
    }

    console.table(req.body);

    db.prepare("INSERT INTO films VALUES (?,?,?,?,?)").run(filmID, req.body.title, req.body.year, req.body.rating, req.body.description);

    res.redirect("/adminpanel");
});

app.post('/delete-movie', function(req, res){
    db.prepare("DELETE FROM films WHERE title=?1 or filmID=?1").run({1:req.body.movieDelete});
    console.table(req.body);
    
    res.redirect("/adminpanel");
});
//---------------------------

//---------------------------
//code for management panel
app.post('/de-re-comission-screen', function (req, res){

    console.log(req.body.booScreen);

    const check = db.prepare("SELECT decomissioned FROM rooms WHERE roomID=?").all(req.body.booScreen);
    
    console.log(check);
    if(0 === check[0].decomissioned){
        db.prepare("UPDATE rooms SET decomissioned=1 WHERE roomID=?").run(req.body.booScreen);
    }
    else{
        db.prepare("UPDATE rooms SET decomissioned=0 WHERE roomID=?").run(req.body.booScreen);
    }

    if(check[0].decomissioned === 0){
        db.prepare("DELETE FROM screenings WHERE roomID=?").run(req.body.booScreen);
    }

    
    let result = db.prepare("SELECT * FROM rooms WHERE roomID=?1").all({1:req.body.booScreen});
    console.table(result);
    console.log(result);

    res.redirect("/managementpanel");
});

app.post('/add-screening', function(req, res){
    let lastRow = db.prepare("SELECT * FROM screenings ORDER BY screeningID DESC LIMIT 1").all()
    let screeningID = 0;
    if (lastRow.length > 0) {
        screeningID = 1 + lastRow[0].screeningID;
    }
    
    let decCheck = db.prepare("SELECT roomID FROM rooms WHERE decomissioned=0 and roomID = ?").all(req.body.roomID);

    console.log(decCheck);
    console.table(decCheck);
    if (decCheck.length === 0) {
        return;
    }

    //console.table(req.body);
    if(decCheck[0].roomID !== undefined){
        db.prepare("INSERT INTO screenings VALUES (?,?,?,?,?)").run(screeningID, req.body.filmID, req.body.roomID, 0, req.body.date+" "+req.body.time);
    }
    
    
    res.redirect("/managementpanel");
});

app.post('/remove-screening', function(req, res){
    if(req.body.optionCH === "screeningID"){
        db.prepare("DELETE FROM screenings WHERE screeningID=?1").run({1:req.body.deleteID});
    }
    else if(req.body.optionCH === "filmID"){
        db.prepare("DELETE FROM screenings WHERE filmID=?1").run({1:req.body.deleteID});
    }
    else if((req.body.optionCH=== "roomID")){
        db.prepare("DELETE FROM screenings WHERE roomID=?1").run({1:req.body.deleteID});
    }

    //console.log(req);
    //console.log();
    //console.log(req.body);
    //console.log();
    //console.table(req.body);

    res.redirect("/managementpanel");
});

app.post('/add-discount', function(req, res){
    db.prepare("INSERT INTO discounts VALUES (?,?)").run(req.body.discountCodeINP, req.body.discountFractionINP);
    res.redirect("/managementpanel");
});

app.post('/remove-discount', function(req, res){
    db.prepare("DELETE FROM discounts WHERE code=?").run(req.body.discountCodeDelINP);
    res.redirect("/managementpanel");
});

//---------------------------
//management and admin handlebars

app.get("/adminpanel",function(req, res){
    let f;
    if(req.query.filmID){
        f = db.prepare("SELECT * FROM films where films.filmID = ?").all(req.query.filmID);
    } else {
        f = db.prepare("SELECT * FROM films").all();
    }

    res.render("adminpanel", {films: f});
});

app.get("/managementpanel",function(req, res){
    let s;
    if (req.query.filmID) {
        s = db.prepare("SELECT screeningID, screenings.filmID, title, roomID, seatsBooked, showtime FROM screenings, films where films.filmID = screenings.filmID and films.filmID = ? order by showtime").all(req.query.filmID);
    } else {
        s = db.prepare("SELECT screeningID, screenings.filmID, title, roomID, seatsBooked, showtime FROM screenings, films where films.filmID = screenings.filmID order by showtime").all();      
    }

    let r = db.prepare("SELECT * FROM rooms").all();
    r.forEach((el) => {el.decomissioned = el.decomissioned === 1 ? "Yes" : "No"}); 
    
    let d = db.prepare("SELECT * FROM discounts").all();
    d.forEach((el) => {el.fractionDiscount = `${el.fractionDiscount * 100}%`});
    
    console.log({screenings: s, rooms: r, discounts: d});
    res.render("managementpanel", {screenings: s, rooms: r, discounts: d});
});

//---------------------------


let server = app.listen(5000, function () {
    console.log('Node server is running..');
});

//Must be at the bottom; DONT MOVE THIS
app.use(express.static(__dirname + '/'));
