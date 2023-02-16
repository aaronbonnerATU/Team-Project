console.log("Hello World! :D");

const sqlite3 = require("sqlite3").verbose();


let db = new sqlite3.Database(':memory:', (err) => {
if (err) {
    return console.error(err.message);
}
console.log('Connected to the in-memory SQlite database.');
  });

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS mytable (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)");
  db.run("INSERT INTO mytable (name, age) VALUES ('John', 30)");
  db.run("INSERT INTO mytable (name, age) VALUES ('Jane', 20)");
  }
);

db.all("SELECT * FROM mytable", function(err, rows) {
  rows.forEach(function (row) {
    console.log(row.id + ": " + row.name + " (" + row.age + ")");
  });
 });

db.close((err) => {
if (err) {
    return console.error(err.message);
}
console.log('Close the database connection.');
});


//b
