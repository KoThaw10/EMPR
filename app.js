
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



// app.post('/login', async (request, response) =>{
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10)
//         const user = { name: req.body.name, password: hashedPassword }
//         users.push(user)
//         res.status(201).send()
//       } catch {
//         res.status(500).send()
//       }

// })

// app.post('/login', async (req, res) => {
//   console.log(req.body)
//     const users = await getData()
    
//     const user = users.find(user => user.user_name === req.body.name)
//     if (user == null) {
//       return res.status(400).send('Cannot find user')
//     }
//     if(req.body.password === user.passwd){
//         console.log('success')
//         res.render('home', {userData: user})
//         //res.status(201).render("home", { userData: user })
//         //res.render('home')
//     }else{
//         res.send("Password is incorrect")
        
//     }
//     //this function  is for after using bcrypt
//     // try {
//     //   if(await bcrypt.compare(req.body.password, user.password)) {
//     //     res.send('Success')
//     //   } else {
//     //     res.send('Not Allowed')
//     //   }
//     // } catch {
//     //   res.status(500).send()
//     // }

//   })

  // app.get('/home', (req,res) => {
  //   console.log("called home")
  //   res.json(users)
  // })

  // app.get('/dashboard', authUser, (req, res) => {
  //   res.send('Dashboard Page')
  // })
  
  // app.get('/admin', authUser, authRole('admin'), (req, res) => {
  //   res.send('Admin Page')
  // })

  // function setUser(req, res, next) {
  //   const userName = req.body.username
  //   const users = getData()
  //   console.log(users)
  //   if (userName) {
  //     req.user = users.find(user => user.id === userId)
  //   }
  //   next()
  // }


//listen on port 3600
app.listen(port, () => console.log('Listening on port '+ port))