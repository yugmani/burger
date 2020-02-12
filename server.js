var express = require("express");
var exphbs = require("express-handlebars");
var mysql = require("mysql");
var path = require('path');

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;


// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "YOUR PASSWORD",
  database: "burgers_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// Use Handlebars to render the main index.html page with the burger in it.
app.get("/", function(req, res) {
  connection.query("SELECT * FROM burgers;", function(err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.render("index", { burgers: data });
  });
});

// Create a new burger
app.post("/api/burgers", function(req, res) {
  connection.query("INSERT INTO burgers (burger_name, devoured) VALUES (?, ?)", [req.body.burger_name, req.body.devoured], function(err, result) {
    if (err) {
      return res.status(500).end();
    }

    // Send back the ID of the new burger
    res.json({ id: result.insertId });
    console.log({ id: result.insertId });
  });
});

//update burger state from undevoured to devoured
app.put("/api/burgers/:id", function(req, res) {
  connection.query("UPDATE burgers SET devoured = ? WHERE id = ?;", [req.body.devoured, req.params.id], function(err, result) {
    if (err) {
      return res.status(500).end();
    }
    else if (result.changedRows === 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    }
    res.json(result);
  });
});


// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
