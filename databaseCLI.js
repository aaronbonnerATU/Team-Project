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
        console.log("7. Create Film");
        console.log("8. Change Film");
        console.log("9. View Films");
        console.log("-1: Exit")

        //3: Get command frm user
        let cmd = readlineSync.question(">: ");

        //4. Swic hstatement t call commands
        switch(cmd) {
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

db.close((err) => {
if (err) {
    return console.error(err.message);
}
console.log('Close the database connection.');
});

mainLoop();

//b
