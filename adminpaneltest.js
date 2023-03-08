const Database = require('better-sqlite3');
const readlineSync = require("readline-sync");
const movieDisplayList = [];

let db = new Database('filmDB.db', {verbose: console.log });
db.pragma('journal_mode = WAL');

console.log('Connected to the in-memory SQlite database.');

function load(){
    const thing = db.prepare("SELECT * FROM films").all();
    console.log(thing);
}


function addfilm(){
    let lastRow = db.prepare("SELECT * FROM films ORDER BY filmID DESC LIMIT 1").all()
    let filmID = 0;
    if (lastRow.length > 0) {
        filmID = 1 + lastRow[0].filmID;
    }

    db.prepare("INSERT INTO films VALUES (?,?,?,?,?)").run(filmID, title, year, rating, description);
}

function deleteFilm(){

}

load();

document.getElementById("newFilmBTN").addEventListener("click",addfilm);
document.getElementById("newFilmBTN").addEventListener("click",addfilm);
