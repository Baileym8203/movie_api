const jwtSecret = 'your_jwt_secret'; // this has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
passport = require('passport');

require('./passport'); // my local passport.js file

let generateJWTToken = (user) => { // will create a JWT token
 return jwt.sign(user, jwtSecret, {
  subject: user.Username, //username encoded in the JWT
  expiresIn: '7d', // specifies the token expiration date
  algorithm: 'HS256' // algorithm used to encode values of the JWT
});
}

/* POST login. */
module.exports = (router) => {
 router.post('/login', (req, res) => {
 passport.authenticate('local', {session: false}, (error, user, info) => {
 if (error || !user) {
 return res.status(400).json({
  message: 'Something is not right',
  user: user
  });
 }
 req.login(user, {session: false}, (error) => {
 if (error) {
 res.send(error);
 }
 let token = generateJWTToken(user.toJSON()); // when logged in will return JWT token in json
 return res.json({user, token});
   });
  })(req, res);
 });
}
