  const express = require("express");
  const morgan = require("morgan");
  const bodyParser = require("body-parser");
  const uuid = require("uuid");
  const mongoose = require('mongoose');
  const Models = require('./models.js');
  /*mongoose.connect('mongodb://localhost:27017/[myFlixDB]', {useNewUrlParser: true, useUnifiedTopology:
  true});*/
  mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology:
  true});


  // this code only allows certain access to certain origins to get info from the API
  
  const { check, validationResult } = require('express-validator');

  const Movies = Models.Movie;
  const Users = Models.User;
  const app = express();
  
  
  
  app.use(morgan("common"));
  app.use(bodyParser.json());
  const cors = require('cors');
  app.use(cors({
    origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
    let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
    return callback(new Error(message ), false);
    }
    return callback(null, true);
    }
  }));
  let allowedOrigins = ['*'];
  let auth = require('./auth.js')(app);
  const passport = require('passport');
  require('./passport');
  
  app.use(express.static("public"));
  //see all movies
  app.get("/movies", passport.authenticate('jwt', {session: false}), (req, res) => {//done
    Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
    console.error(err);
    res.status(500).send('error ' + err);
    });
    });
  // app home screen
  app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
  });
  
    // Add a movie
  app.post('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.body.Title })
      .then((movie) => {
        if (movie) {
          return res.status(400).send(req.body.Title + 'already exists');
        } else {
          Movies
            .create({
              Title: req.body.Title,
              Description: req.body.Description,
              Genre: req.body.Genre,
              Director: req.body.Director,
              ImagePath: req.body.ImagePath,
            })
            .then((movie) =>{res.status(201).json(movie) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });
  //Get a single movie by title
  app.get("/movies/:Title", passport.authenticate('jwt', {session: false}), (req, res) => {
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
  app.get("/movies/Director/:Director", passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find({'Director.Name': req.params.Director})
    .then((movie) => {
    res.json(movie);
    })
    .catch((err) => {
    console.error(err);
    res.status(500).send('error: ' + err);
    });
  });

  //Get list of movies by genre
  app.get("/movies/Genre/:Genre", passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find({'Genre.Name': req.params.Genre})
    .then((movie) => {
    res.json(movie);
    })
    .catch((err) => {
    console.error(err);
    res.status(500).send('error: ' + err);
    });
  });

  //adds movie to the list of favorites of a user
  app.post("/users/:Username/movies/:movie_id", passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
    $push: { FavoriteMovies: req.params.movie_id },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
    if (err) {
    console.error(err);
    res.status(500).send("Error: " + err);
    } else {
    res.json(updatedUser);
    }
    }
    );
    });
  //removes movie from the list of favorites of a user
  app.delete("/users/:Username/movies/:movie_id", passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },{
      $pull: { FavoriteMovies: req.params.movie_id }
      },{ new: true }) // This line makes sure that the updated document is returned)
  .then((user) => {
    if (!user) {
    res.status(400).send(req.params.movie_id + ' was not found');
    } else {
    res.status(200).send(req.params.movie_id + ' was deleted from favorites.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('error: ' + err);
  });

  });


  app.post("/users", [
  //these are all validations for the username and password in the server side!
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => { //done
    //check for validation on the username and password!
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array() });
    }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.username})
    .then((user) => {
    if (user) {
    return res.status(400).send(req.body.username + 'already exists');
    } else {
    Users 
    .create({
    Username: req.body.Username,
    Password: hashedPassword,
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
      res.status(500).send('Error: ' + error);
    });
  });
  

  app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) =>  {//done
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('error ' + err);
  });
  });

  app.put('/users/:Username',[
    //these are all validations for the username and password in the server side!
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], passport.authenticate('jwt', {session: false}), (req, res) => {
      //check for validation on the username and password!
      let errors = validationResult(req);

      if(!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array() });
  }
      let hashedPassword = Users.hashPassword(req.body.Password);

      Users.findOneAndUpdate({ Username: req.params.Username}, {$set:
  {
  Username: req.body.Username,
  Password: hashedPassword,
  Email: req.body.Email,
  Birthday: req.body.Birthday
  }
  },
  {new: true}, // this line makes sure that the updated document is returned
  ((err, updatedUser) => {
  if (err) {
  console.error(err);
  res.status(500).send('error: ' + err);
  } else {
  res.json(updatedUser);
  }
  }));
  });

  app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {//done
  Users.findOne({Username: req.params.Username})
  .then((user) => {
  res.json(user);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('error ' + err);
  });
  });

  app.delete("/users/:Username", passport.authenticate('jwt', {session: false}), (req, res) => {//done
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
  app.get("/Director/:name", passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({'Director.Name': req.params.name})
    .then((movie) => {
    res.json(movie.Director)
    })
    .catch((err) => {
    console.error(err);
    res.status(500).send('error: ' + err);
    })
  });

  app.get("/genre/:name", passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.name})
  .then((movie) => {
  res.json(movie.Genre)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('error: ' + err);
  })
  });
   //end
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });
  // listen for requests \\
  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
    console.log("listening on port " + port);
  });

  