console.log("Hello World! :D");

const Database = require('better-sqlite3');
const readlineSync = require("readline-sync");
const { v4: uuid } = require('uuid');

let db = new Database('filmDB.db', {verbose: console.log });
db.pragma('journal_mode = WAL');

console.log('Connected to the in-memory SQlite database.');

function mainLoop() {
    db.prepare("CREATE TABLE IF NOT EXISTS films (filmID INT PRIMARY KEY, title VARCHAR(100), year INT, rating VARCHAR(3), description VARCHAR)").run();
    db.prepare("CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY, startdate DATE, UNIQUE(startdate))").run();
    db.prepare("CREATE TABLE IF NOT EXISTS tickets (screeningID INT PRIMARY KEY, uuid BINARY(16))").run();
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

//searchFilms()
//bookTicket()
//viewSchedule()

function searchFilms(){//Seaches for the films that include whatever you type into the question thing
    
    //desplays a menu
    console.log("******************");
    console.log("|1. Title        |");
    console.log("|2. Rating       |");
    console.log("|3. Year         |");
    console.log("|4. Description  |");
    console.log("******************");

    //asks for the option
    let num = readlineSync.question("What do you want to search for the movie by?:");

    let listOfFilms=[];

    //switch case thing
    switch(num){
        case "1": //searches for any movie that has a the same or similiar title
            let title = readlineSync.question("Title(0 to cancel):");
            if (title === "0") {
                return;
            }
            listOfFilms = db.prepare("SELECT * FROM films WHERE title LIKE '%'||?||'%'").all(title);//no sql injection lmao
            break;   
        case "2"://searches for movies based on rating
            const RATINGS = ["G", "PG", "12A", "15A", "16", "18"];
            let rating = readlineSync.keyInSelect(RATINGS, "Rating(0 to cancel):"); 
            if (rating === "0") {
                return;
            }
            listOfFilms = db.prepare("SELECT * FROM films WHERE rating LIKE '%'||?||'%'").all(RATINGS[rating]);//no sql injection lmao
            break;
        case "3"://searches for movie based on the year it was made in
            let year = readlineSync.question("Year(0 to cancel):");
            if (year === 0) {
                return;
            }
            listOfFilms = db.prepare("SELECT * FROM films WHERE year=?").all(year);//no sql injection lmao
            break;
        case "4"://searches for movie based on whatever you search for is in the movies description
            let description = readlineSync.question("Description(0 to cancel):");
            if (description === "0") {
                return;
            }
            listOfFilms = db.prepare("SELECT * FROM films WHERE description LIKE '%'||?||'%'").all(description);//no sql injection lmao
            break;
    }
    
    //displays stuff
    console.table(listOfFilms);

}

function bookTicket(){//lets you book one(if you got no game) or more tickets 

    //asks for title
    let title = readlineSync.question("What movie do you want to book a ticket for(0 to cancel)?: ");
    if(title === "0"){
        return;
    }

    //asks for year
    let year = readlineSync.questionInt("Add a year for schedule(0 to Quit): ", { min: 2023, max: 2025 });
    if(year == 0){
        return;
    }

    //asks for month
    let month = readlineSync.questionInt("Add a month for schedule(0 to Quit): ",{ min: 1, max: 12 });
    if(month == 0){
        return;
    }

    //turns year and month into date(no schedule, useless for now)
    let scheduleDate = (new Date(year, month-1)).toISOString().slice(0,10);
    
    let numberOfTickets = readlineSync.questionInt("How many tickets do you want to buy(0 to cancel)?: ");

    //creates an/multiple entry(s) into the tickets table with unique uuids
    for(let x = 0; x < numberOfTickets; x++){
        db.prepare("INSERT INTO tickets VALUES (?,?)").run(0,uuid());
    }
    //const list = db.prepare("SELECT price, _(emptySeats)_ FROM screening scr, schedule sch WHERE title=? AND date=?").run(title, scheduleDate);
    db.prepare("SELECT * FROM tickets").run();//just shows all of the tickets within the tickets table, just to see(wont be obviously implemented at the end)
    //console.log(list);
}

function viewSchedule(){//view schedule, as the name implies, you dumbo //not implemented yet because we dont have screenings implemented. dumbo
    
    //Asks user year
    let year = readlineSync.questionInt("Year(0 to Quit): ", { min: 2023, max: 2025 });
    if(year == 0){
        return;
    }

    //asks user for month
    let month = readlineSync.questionInt("Month(0 to Quit): ",{ min: 1, max: 12 });
    if(month == 0){
        return;
    }

    //turns year and month into date
    let scheduleDate = (new Date(year, month-1)).toISOString().slice(0,10);

    //searches for schedule based on the date
    let schedule = db.prepare("SELECT * FROM schedules WHERE startdate=?").all(scheduleDate);

    //shows schedule
    console.table(schedule);
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
    //asking the user to create a year for the schedule
    let year = readlineSync.questionInt("Add a year for schedule(q to Quit): ", { min: 2023, max: 2025 });
    if(year == "q"){
        return;
    }
    //asking the user to create a month for the schedule
    let month = readlineSync.questionInt("Add a month for schedule(q to Quit): ",{ min: 1, max: 12 });
    if(month == "q"){
        return;
    }

    // let date = readlineSync.question("Add a date for schedule(q to Quit):",{ min: 1, max: 31 } );
    // if(date =="q"){
    //     return;
    // }

    let lastRow = db.prepare("SELECT * FROM schedules ORDER BY id DESC LIMIT 1").all()
    let scheduleID = 0;
    if (lastRow.length > 0) {
        scheduleID = 1 + lastRow[0].id;
    }
    //adding those values into a DATE value 
    let scheduleDate = (new Date(year, month-1)).toISOString().slice(0,10);
    //inserting the DATE oblect into the database

    let result = db.prepare("INSERT OR IGNORE INTO schedules VALUES (?,?)").run(scheduleID, scheduleDate);

    if (result.changes == 0){
        console.log("Date already exists!");
    }
    
    //console.table(db.prepare("select * from schedules").all());
    // db.all("SELECT * FROM schedules", function(_err, rows) {
    //   rows.forEach(function (row) {
    //     console.log(row.date1);
    //   });
    //  });
}    


function changeSchedule(){
    //let noOfSchedules = viewSchedule();
    let noOfSchedules = db.prepare("SELECT COUNT(id) FROM schedules").all()[0]["COUNT(id)"];
    //if there is no schedules to modify
    if(noOfSchedules == 0){
        console.log("There are no schedules to modify");
        return;
    }
    //get the schedule from the user
    let scheduleID = readlineSync.questionInt("Schedule ID to modify :");
    
    if(db.prepare("select scheduleID from schedule where scheduleID = ?").all(scheduleID).length !== 1){
        console.log("Invalid ID!");
        return;
    }
    //Modify the month of that schedule, if it is does exist change schedule  
    let month = readlineSync.question("Month(blank to leave the same, q to quit):");
    if(month === "0"){
        return;
    } else if(month !== ""){
        db.prepare("update schedules set month = ? where scheduleID = ?").run(month,scheduleID);

    }

    //Modify the year of that schedule
    //Modify the year.
    let year = readlineSync.questionInt("Year(blank to stay same): ", { min: 1900, max: 3000 });
    if (year !== "") {
        db.prepare("update films set year = ? where scheduleID = ?").run(year, filmID);
    }




    // db.serialize(() => {
    //     db.prepare("CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY, date1 TEXT)").run();
    //     db.prepare("INSERT INTO schedules (changedDate) VALUES (changedDate)").run();
      
    //     }
    //   );
      
    //   db.all("SELECT * FROM schedules", function(_err, rows) {
    //     rows.forEach(function (row) {
    //       console.table(row.changedDate);
    //     });
    //    });



}
function deleteScreening(){

    //asks the user what year needs to be deleted
    let year = readlineSync.questionInt("Delete a year for schedule(q to Quit): ", { min: 2023, max: 2025 });
    if(year == "q"){
        return;
    }
    //asking the user to delete a month for the schedule
    let month = readlineSync.questionInt("Delete a month for schedule(q to Quit): ",{ min: 1, max: 12 });
    if(month == "q"){
        return;
    }

    //adding those values into a DATE value 
    let scheduleDate = (new Date(year, month-1)).toISOString().slice(0,10);


    //delete from the schedules table, and inform the user if no such schedule exists.
    let result = db.prepare("DELETE from schedules where startdate  = ?").run(scheduleDate);
    
    if (result.changes == 0){
        console.log("There are no schedules to delete");
    }

}
