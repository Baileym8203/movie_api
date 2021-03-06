 /**
  * THIS IS WORKING!!
  */ 


const express = require("express");
  const morgan = require("morgan");
  const bodyParser = require("body-parser");
  const uuid = require("uuid");
  const mongoose = require('mongoose');
  const Models = require('./models.js');
  //mongoose.connect('mongodb://localhost:27017/[myFlixDB]', {useNewUrlParser: true, useUnifiedTopology:
  //true}); when running local!
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
  app.use(cors()); //allowed all domains!
  /*(app.use(cors({
    origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
    let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
    return callback(new Error(message ), false);
    }
    return callback(null, true);
    }
  }));*/
  
  //let allowedOrigins = ['localhost:1234', 'localhost:8080', 'https://github.com', 'https://www.wikipedia.org/' ];
  let auth = require('./auth.js')(app);
  const passport = require('passport');
  require('./passport');
  
  app.use(express.static("public"));
  //see all movies
  
  /**
   * This is the API endpoint for receiving all movies in the MongoDB database
   * when called upon via GET rest API form
   */
  
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {//done
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

/**
 * This is the API endpoint for posting a new movie to the MongoDB database
 * When called upon via the POST rest API form using
 * @param Title
 * @param Description
 * @param Genre
 * @param Director
 * @param ImagePath
 * if all params are correctly placed the movie through POST will be added
 */

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

/**
 * this is the API endpoint for a specific movie by title
 * using the rest API via GET and 
 * @param Title
 * The title will also be used within the URL after movies
 */

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

/**
 * This is the API endpoint for the movie directors by name
 * using the rest API via GET
 * When using this API endpoint be sure to call with Director.Name!
 */

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

/**
 * This is the API endpoint for the movie genres by name
 * using the rest API via GET
 * when using this API endpoint be sure to call with Genre.Name!
 */

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

/**
 * This is the API endpoint for adding a movie to the list of favorites to the user
 * using the rest API via POST
 * This needs the username of the user from the database to function!
 */

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

/**
 * This API endpoint is to delete a favorite movie from the list on users
 * using the rest API via DELETE
 * This needs the username of the user from the database to function!
 * This also needs the movie ID to be found for the deletion to follow through!
 */

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

  // will create a new user

  /**
   * This API endpoint is used for posting new users
   * using rest API via POST and
   * @param Username
   * @param Password
   * @param Email
   * @param Birthday
   * If used correctly this will post a new user with the information used within the params
   */

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
  
 // will get all of the users in the database

/**
 * This API endpoint is used to get a user from the database
 * using the rest API via GET
 * this will be used with a login endpoint to pull the users data and
 * @param Username
 * @param Password
 * @param Email
 * @param Birthday
 * if used correctly the user data will be pulled from the user data received
 */

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
  //updates user
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
  // this will get a user by username

  /**
   * This API endpoint is used to get a user by username
   * using the rest API via GET
   * This requires the username to be functional!
   */

  app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {//done
  Users.findOne({Username: req.params.Username})//.populate('FavoriteMovies')
  // add method populate
  .then((user) => {
  res.json(user);
  })
  .catch((err) => {
  console.error(err);
  res.status(500).send('error ' + err);
  });
  });
  // this will delete a user by username

/**
 * This is the API endpoint for deleting a user by username
 * using the rest API via DELETE
 * this requires the username for this to function!
 */

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

/**
 * This is the API endpoint for the movie directors by name
 * using the rest API via GET
 * When using this API endpoint be sure to call with Director.Name!
 */

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
  //genre by name

/**
 * This is the API endpoint for the movie Genre by name
 * using the rest API via GET
 * When using this API endpoint be sure to call with Genre.Name!
 */

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

  