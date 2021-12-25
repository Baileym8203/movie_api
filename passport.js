const passport = require('passport'),
localStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

// creates the username and password requirements 
passport.use(new localStrategy({
usernameField: 'Username',
passwordField: 'Password'
}, (username, password, callback) => {
console.log(username + ' ' + password);
Users.findOne({ Username: username}, (error, user) => {
if (error) {
console.log(error);
return callback(error);
}
if (!user) {
console.log('incorrect username');
return callback(null, false, {message: 'incorrect username or password.'});
}
// this will validate the users password being null or false when inputted!
if (!user.validatePassword(password)) {
 console.log('incorrect password');
 return callback(null, false, {message: 'Incorrect password'});
}

console.log('finished');
return callback(null, user);

  });
}));
// after login will confirm the JWT token as correct with the given user 
passport.use(new JWTStrategy({
jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
return Users.findById(jwtPayload._id)
.then((user) => {
return callback (null, user);
})
.catch((error) => {
return callback(error)
});
}));