const express = require("express");
const app = express();
const morgan = require("morgan")

let topMovies = [
{
 title: 'harry potter and the sorcerer\'s stone',
 author: 'J.K. Rowling'
},
{
 title: 'Lord of the rings',
 author:'J.R.R. Tolkien'
},
{
 title: 'Twilight',
 author: 'stephanie Meyer'

 }
];

app.use(morgan("common")); 
app.use(express.static("public"));



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

