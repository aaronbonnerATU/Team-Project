console.log("Hello World! :D");

const Database = require('better-sqlite3');

const readlineSync = require("readline-sync")

let db = new Database(':memory:', {verbose: console.log });

console.log('Connected to the in-memory SQlite database.');

function mainLoop() {
    db.prepare("CREATE TABLE IF NOT EXISTS films (filmID INT, title VARCHAR(100), year INT, rating VARCHAR(3), description VARCHAR)").run();
    //All commands will have th efollowing structure in a function:
    while (true) { //1. WHile true loop

        //2: Print out options if any
        console.log("**********************")
        console.log("*  CINEMA SQL TEST   *")
        console.log("**********************")
        //Oskar: 1, 2, 3
        console.log("1. Search Films");
        console.log("2. Book Ticket");
        console.log("3. View Schedule");
        //Aaron: 4, 5, 6
        console.log("4. Create Schedule");
        console.log("5. Change Schedule");
        console.log("6. Delete Screening");
        //Michael: 7, 8, and 9.
        //Film:
        //ID
        //Title
        //Rating
        //Year
        //Description
        console.log("7. Create Film");
        console.log("8. Change Film");
        console.log("9. View Films");
        console.log("-1: Exit")

        //3: Get command frm user
        let cmd = readlineSync.question(">: ");

        //4. Swic hstatement t call commands
        switch (cmd) {
            case "-1":
                return;
            case "1":
                searchFilms();
                break;
            case "2":
                bookTicket();
                break;
            case "3":
                viewSchedule();
                break;
            case "4":
                createSchedule();
                break;
            case "5":
                changeScreening();
                break;
            case "6":
                deleteScreening();
                break;
            case "7":
                createFilm();
                break;
            case "8":
                changeFilm();
                break;
            case "9":
                viewFilms();
                break;
        }
    }
}

function createFilm() { //Lets the user input in a film's details to add to the database.

    //Read in title
    let title = readlineSync.question("Movie Title(0 to cancel): ");
    if (title === "0") {
        return;
    }

    //Read in ratings
    const RATINGS = ["G", "PG", "12A", "15A", "16", "18"]
    let rating = readlineSync.keyInSelect(RATINGS, "Rating:");
    if (rating === "0") {
        return;
    }
    rating = RATINGS[rating];

    //Read in year
    let year = readlineSync.questionInt("Release Year: ", { min: 1900, max: 3000 });
    if (year === "0") {
        return;
    }

    //Read in description
    let description = readlineSync.question("Movie description(0 to cancel)");
    if (description === "0") {
        return;
    }

    // console.log(title);
    // console.log(year);
    // console.log(rating);
    // console.log(description);

    //Get new film ID by adding one to the largest one.
    //This'll leave gaps if they're ever deleted, but it saves the issue of fumbling around IDs if a film is deleted.
    let lastRow = db.prepare("SELECT * FROM films ORDER BY filmID DESC LIMIT 1").all()
    let filmID = 0;
    if (lastRow.length > 0) {
        filmID = 1 + lastRow[0].filmID;
    }

    //Insert film into the database.
    db.prepare("INSERT INTO films VALUES (?,?,?,?,?)").run(filmID, title, year, rating, description); 

    //Log success!
    console.log("Films added successuflly.");
}

function changeFilm() { //Modify a film given it's ID.
    
    //Show films, and get how many there are.
    let noOfFilms = viewFilms();

    //If there are no films to modify, return an error.
    if (noOfFilms == 0) {
        console.log("No films to modify.");
        return;
    }

    //Get filmID from the user.
    let filmID = readlineSync.questionInt("Film ID to modify: ");

    //If the film doesnt exist(Invalid filmID), exit.
    if (db.prepare("select filmID from films where filmID = ?").all(filmID).length !== 1) {
        console.log("Invalid ID!");
        return;
    }

    //Modify the title.
    let title = readlineSync.question("Movie Title(blank to leave same, 0 to cancel): ");
    if (title === "0") {
        return;
    } else if (title !== "") {
        db.prepare("update films set title = ? where filmid = ?").run(title, filmID);
    };

    //Modify the ratings.
    const RATINGS = ["G", "PG", "12A", "15A", "16", "18", "STAY SAME"]
    let rating = readlineSync.keyInSelect(RATINGS, "Rating:");
    rating = RATINGS[rating];
    if (rating == "0") {
        return;
    } else if (rating !== "") {
        db.prepare("update films set rating = ? where filmid = ?").run(rating, filmID);
    }

    //Modify the year.
    let year = readlineSync.questionInt("Release Year(blank to stay same): ", { min: 1900, max: 3000 });
    if (year !== "") {
        db.prepare("update films set year = ? where filmid = ?").run(year, filmID);
    }

    //Modify the description
    let description = readlineSync.question("Movie description(blank to stay the same, 0 to cancel):");
    if (description === "0") {
        return;
    } else if (description !== "") {
        db.prepare("update films set description = ? where filmid = ?").run(description, filmID);
    }
}

function viewFilms() { //Get all films and print them as a table to the user, returning how many they are.
    let result = db.prepare("select * from films").all();
    console.table(result);
    return result.length
}

mainLoop();

//Aarons Functions comment out if needed
function createSchedule(){
    let year = readlineSync.question("Add a year for schedule(q to Quit): ", { min: 2023, max: 2025 });
    if(year == "q"){
        return;
    }

    let month = readlineSync.question("Add a month for schedule(q to Quit): ",{ min: 1, max: 12 });
    if(month == "q"){
        return;
    }

    let date = readlineSync.question("Add a date for schedule(q to Quit):",{ min: 1, max: 31 } );
    if(date =="q"){
        return;
    }

    db.serialize(function()  {
      db.run("CREATE TABLE IF NOT EXISTS mytable (id INTEGER PRIMARY KEY, year INT , month INT, date INT)",function (err){
        if(err){
            console.log(err.message);
        }
      });
      db.run("INSERT INTO mytable VALUES (?,?,?,?)", [year,month,date], function (err){
        if(err){
            console.log(err.message);
        }
      });
    }
    );
    
    // db.all("SELECT * FROM mytable", function(_err, rows) {
    //   rows.forEach(function (row) {
    //     console.log(row.date1);
    //   });
    //  });
    }


function changeSchedule(createSchedule){
    const changedDate = new createSchedule()
    changedDate.setDate('January 3,2023 13:00:00')

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS mytable (id INTEGER PRIMARY KEY, date1 TEXT)");
        db.run("INSERT INTO mytable (changedDate) VALUES (changedDate)");
      //   db.run("INSERT INTO mytable (name, age) VALUES ('Jane', 20)");
        }
      );
      
      db.all("SELECT * FROM mytable", function(_err, rows) {
        rows.forEach(function (row) {
          console.log(row.changedDate);
        });
       });



}
function deleteScreening(){
    db.all("DELETE FROM mytable",function(_err,rows) {
        console.log("The row that was deleted: " + result.affectedRows);
    });

    }

