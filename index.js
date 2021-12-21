const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require('mongoose');
const Models = require('./models.js');
mongoose.connect('mongodb://localhost:27017/[myFlixDB]', {useNewUrlParser: true, useUnifiedTopology:
true});


const Movies = Models.Movie;
const Users = Models.User;
const app = express();
app.use(morgan("common"));
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/movies", (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
   })
  .catch((err) => {
  console.error(err);
  res.status(500).send('error ' + err);
   });
  });

//Get a single movie by title
app.get("/movies/:title", (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('error ' + err);
   });
  });

//Get list of movies by director
app.get("/movies/director/:director", (req, res) => {
  res.send("directors");
});

//adds movie to the list of favorites of a user
app.post("/users/:id/movies/:movie_id", (req, res) => {
  {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      
    })
  });
//removes movie from the list of favorites of a user
app.delete("/users/:id/movies/:movie_id", (req, res) => {
  res.send("Successful DELETE request added movies to the list of favorites");
});

app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username})
  .then((user) => {
  if (user) {
  return res.status(400).send(req.body.Username + 'already exists');
  } else {
  Users 
  .create({
  Username: req.body.Username,
  Password: req.body.Password,
  Email: req.body.Email,
  Birthday: req.body.Birthday
  })
  .then((user) => {res.status(201).json(user) })
  .catch((error) => {
  console.log(error);
  res.status(500).send('error:' + error);
  })
  }
  })
 .catch((error) => {
  console.error(error);
  res.status(500).send('error' + error);
 });
});

app.get('/users', (req, res) =>  {
Users.find()
.then((users) => {
  res.status(201).json(users);
 })
.catch((err) => {
console.error(err);
res.status(500).send('error ' + err);
 });
});

app.put('/users/:Username', (req, res) => {
Users.findOneAndUpdate({ Username: req.params.Username}, {$set:
 {
Username: req.body.Username,
Password: req.body.Password,
Email: req.body.Email,
Birthday: req.body.Birthday
 }
},
{new: true}, // this line makes sure that the updated document is returned
(err, updatedUser => {
if (err) {
console.error(err);
res.status(500).send('error: ' + err);
} else {
res.json(updatedUser);
}
}));
});

app.get('/users/:Username', (req, res) => {
Users.findOne({Username: req.params.Username})
.then((user) => {
res.json(user);
})
.catch((err) => {
console.error(err);
res.status(500).send('error ' + err);
 });
});

app.delete("/users/Username:", (req, res) => {
Users.findOneAndRemove({Username: req.params.Username})
 .then((user) => {
  if (!user) {
  res.status(400).send(req.params.Username + ' was not found');
  } else {
  res.status(200).send(req.params.Username + ' was deleted.');
  }
 })
 .catch((err) => {
  console.error(err);
  res.status(500).send('error: ' + err);
 });

});

// gets the data about a single director, by name \\
app.get("/directors/:name", (req, res) => {
  Movies.findOne({Director: req.params.Director})
  .then((movie) => {
  res.json(movie)
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('error: ' + err);
  })
});

app.get("/genre/:name", (req, res) => {
 Movies.findOne({Genre: req.params.Genre})
 .then((movie) => {
 res.json(movie)
 })
 .catch((err) => {
  console.error(err);
  res.status(500).send('error: ' + err);
 })
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
// listen for requests \\
app.listen(8080, () => {
  console.log("your app is listening on port 8080.");
});