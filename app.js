
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const path = require('path');
const session = require('express-session')
const {v4: uuidv4} = require('uuid')
const port = 5600
//const { authUser, authRole } = require('./authUser')
app.use(express.json())
app.use(bodyParser.json());
//const bcrypt = require('bcrypt');
//const { getData } = require('./database');
const router = require('./routes/router');

app.use(express.static('public'));

const time = 1000 * 60 * 60 * 8;
app.use(session({
  secret: uuidv4(),
  resave: 'false',
  cookie: { maxAge: time },
  saveUninitialized:true
}))



// app.use(setUser)
// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use('/', router)

app.get('/', (req, res) => {
    res.render('login')
})


//listen on port 3600
app.listen(port, () => console.log('Listening on port '+ port))