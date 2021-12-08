const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();
app.use(morgan("common"));
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/movies", (req, res) => {
  res.send("all movies");
});

//Get a single movie by title
app.get("/movies/:title", (req, res) => {
  res.send("title of movie")
});

//Get list of movies by director
app.get("/movies/director/:director", (req, res) => {
  res.send("directors");
});

//adds movie to the list of favorites of a user
app.put("/users/:id/movies/:movie_id", (req, res) => {
  res.send("Successful PUT request added movies to the list of favorites");
});

//removes movie from the list of favorites of a user
app.delete("/users/:id/movies/:movie_id", (req, res) => {
  res.send("Successful DELETE request added movies to the list of favorites");
});

app.post("/users", (req, res) => {
  res.send("Successful POST request to register new user");
});

app.delete("/users", (req, res) => {
  res.send("Successful DELETE request to register new user");
});

// gets the data about a single director, by name \\
app.get("/directors/:name", (req, res) => {
  res.send(
    "Successful GET request to get data about a single director by name"
  );
});

app.get("/genre/:name", (req, res) => {
  res.send("Successful GET request to get data about a single genre by name");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
// listen for requests \\
app.listen(8080, () => {
  console.log("your app is listening on port 8080.");
});