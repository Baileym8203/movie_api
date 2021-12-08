const express = require("express");
const app = express();
const morgan = require("morgan")
bodyParser = require('body-parser'),
      uuid = require('uuid');

    const app = express();
    app.use(bodyParser.json());

    let topMovies = [
{
 id: 1,
 title: 'harry potter and the sorcerer\'s stone',
 author: 'J.K. Rowling',
 director: 'this person',
 genre: 'this genre'
},
{
 id: 2,
 title: 'Lord of the rings',
 author:'J.R.R. Tolkien',
 director: 'this person',
 genre: 'this genre'
},
{
 id: 3,
 title: 'Twilight',
 author: 'stephanie Meyer',
 director: 'this person',
 genre: 'this genre'
 }
];

app.use(morgan("common")); 
app.use(express.static("public"));

// gets the data about a single director, by name \\

app.get('/movies/:director', (req, res) => {
  res.json(topMovies.find((movies) => {
  return movies.director ===req.params.director
  }));
  });
  
  app.get('/movies/:director/:genre', (req, res) => {
    res.json(topMovies.find((movies) => {
    return movies.genre ===req.params.genre
    }));
    });
  
  //adds data for a new movie to our list of movies. \\
  
  app.post('/movies', (req, res) => {
  let newMovie = req.body;
  
  if (!newMovie.name) {
  const message = 'missing name in request body';
  res.status(400).send(message);
  } else {
  newMovie.id = uuid.v4();
  movies.push(newMovie);
  res.status(201).send(newMovie);
   }
  });
  
  // deletes a movie from our list by ID \\
  app.delete('/movies/:id', (req, res) => {
  let movie = topMovies.find((movie) => {
  return movie.id === req.params.id
  });
  
  if (movie) {
  movie = movie.filter((obj) => {
  return obj.id !== req.params.id 
  });
  res.status(201).send('movie ' + req.params.id + ' was deleted');
  
  }
  });
  
  // make the "user" of a user \\
  
  app.put('/movies/:director/:genre/:imageURL/:user', (req, res) => {
  let user = user.find((user) => {
  return user.user === req.params.user
  });
  
  if (user) {
  user.user[req.params.user] = parseInt(req.params.user);
  res.status(201).send('user ' + req.params.user + ' was added ' + req.params.grade + ' in ' + req.params.movies);
  } else {
  res.status(404).send('user with the name ' + req.params.user + ' cannot be made.');
  }
  });

// GET requests \\
app.get('/', (req, res) => {
res.send('Welcome to my app');
});

app.get('/secreturl', (req, res) => {
res.send('this is a secret url with top secret content!')
});

app.get('/movies', (req, res) => {
res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
// listen for requests \\
app.listen(8080, () => {
 console.log('your app is listening on port 8080.')
});

