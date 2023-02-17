console.log("Hello World! :D");

const sqlite3 = require("sqlite3").verbose();
const readlineSync = require("readline-sync")

let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

function mainLoop() {
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

function createFilm() {
    let title = readlineSync.question("Movie Title(0 to cancel): ");
    if (title === "0") {
        return;
    }
    const RATINGS = ["G", "PG", "12A", "15A", "16", "18"]
    let rating = readlineSync.keyInSelect(RATINGS, "Rating:");
    if (rating === "0") {
        return;
    }

    rating = RATINGS[rating];

    let year = readlineSync.questionInt("Release Year: ", { min: 1900, max: 3000 });
    if (year === "0") {
        return;
    }

    let description = readlineSync.question("Movie description(0 to cancel)");
    if (description === "0") {
        return;
    }
    console.log(title);
    console.log(year);
    console.log(rating);
    console.log(description);

    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS films (title VARCHAR(100), year INT, rating VARCHAR(3), description VARCHAR)", [], function (err) {
            if (err) {
                console.log(err.message);
            }
        });
        db.run("INSERT INTO films VALUES (?,?,?,?)", [title, year, rating, description], function (err) {
            if (err) {
                console.log(err.message);
            }
        });
    });

    console.log("Films added successuflly.");
}

function viewFilms() {
    console.log("Hello!");

    db.serialize(function () {
        console.log("A");

        db.all("SELECT * FROM films", [], (err, rows) => {
            console.log("Ran!");

            if (err) {
                console.log("Query Failed.");
            }
            if (rows == undefined) {
                console.log("No films exist.")
            }
            console.log(rows);
            console.table(rows);
        }
        )
    }
    );
    console.log("Hello!!!");
}
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Close the database connection.');
});

mainLoop();

//b
