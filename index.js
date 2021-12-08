const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();
app.use(morgan("common"));
app.use(bodyParser.json());

app.use(express.static("public"));

let topMovies = [
  {
    id: 1,
    title: "harry potter and the sorcerer's stone",
    author: "J.K. Rowling",
    director: "this person",
    genre: "this genre",
  },
  {
    id: 2,
    title: "Lord of the rings",
    author: "J.R.R. Tolkien",
    director: "this person",
    genre: "this genre",
  },
  {
    id: 3,
    title: "Twilight",
    author: "stephanie Meyer",
    director: "this person",
    genre: "this genre",
  },
];

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

//Get a single movie by title
app.get("/movies/:title", (req, res) => {
  res.json(
    topMovies.find((movies) => {
      return movies.title === req.params.title;
    })
  );
});

//Get list of movies by director
app.get("/movies/director/:director", (req, res) => {
  res.json(
    topMovies.filter((movies) => {
      return movies.director === req.params.director;
    })
  );
});

//Get list of movies by genre
app.get("/movies/genre/:genre", (req, res) => {
  res.json(
    topMovies.filter((movies) => {
      return movies.genre === req.params.genre;
    })
  );
});

//adds data for a new movie to our list of movies. \\
app.post("/movies", (req, res) => {
  let newMovie = req.body;

  if (!newMovie.name) {
    const message = "missing name in request body";
    res.status(400).send(message);
  } else {
    newMovie.id = uuid.v4();
    movies.push(newMovie);
    res.status(201).send(newMovie);
  }
});

// deletes a movie from our list by ID \\
app.delete("/movies/:id", (req, res) => {
  let movie = topMovies.find((movie) => {
    return movie.id === req.params.id;
  });

  if (movie) {
    topMovies = topMovies.filter((obj) => {
      return obj.id !== req.params.id;
    });
    res.status(201).send("movie " + req.params.id + " was deleted");
  } else {
    res.status(404).send("movie not found");
  }
});

//adds movie to the list of favorites of a user
app.post("/users/:id/movies/:movie_id", (req, res) => {
  res.send("Successful POST added movies to the list of favorites");
});

//removes movie from the list of favorites of a user
app.post("/users/:id/movies/:movie_id", (req, res) => {
  res.send("Successful POST added movies to the list of favorites");
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

// GET requests \\
app.get("/", (req, res) => {
  res.send("Welcome to my app");
});

app.get("/secreturl", (req, res) => {
  res.send("this is a secret url with top secret content!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
// listen for requests \\
app.listen(8080, () => {
  console.log("your app is listening on port 8080.");
});
