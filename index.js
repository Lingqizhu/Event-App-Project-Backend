/// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { v4: uuidv4} = require('uuid');
const { Event } = require('./models/eventSchema');
const { User } = require('./models/userSchema');

mongoose.connect("mongodb+srv://Lingqizhu:Peggy1980122@cluster0.k9dxo.mongodb.net/Event?retryWrites=true&w=majority");

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.post('/auth', async (req,res) => {
  const user = await User.findOne({userName: req.body.userName})
  if(!user){
    return res.sendStatus(401);
  }
  if(req.body.password !== user.password){
    return res.sendStatus(403);
  }
  user.token = uuidv4()
  await user.save();

  res.send({token: user.token})
})


app.use( async (req,res,next) => {
  const authHeader = req.headers['authorization'];
  const user = await User.findOne({token: authHeader})

  if(user){
    next();
  } else {
    res.sendStatus(403);
  }

} )


// defining CRUD operations
/* app.get('/', async (req, res) => {
  res.send(await Event.find());
}); */

// exports.index = function (req, res) {
//     Book.find().then((books) => res.send(books));
//   };

app.get('/', function (req, res){
    Event.find().then((events)=> res.send(events))
})


//search by location
app.get('/location/:location', async(req, res)=>{
    res.send(await Event.find({location: req.params.location}))
})

app.get('/name/:name', async(req, res)=>{
    res.send(await Event.find({name: req.params.name}))
})



// create new event
app.post('/', async (req, res) => {
  const newEvent = req.body;
 const event = new Event(newEvent);
  await event.save();
  res.send({ message: 'New event inserted.' });
});

// delete event
app.delete('/:id', async (req, res) => {
  await Event.deleteOne({ _id: ObjectId(req.params.id) })
  res.send({ message: 'Event removed.' });
});

// update event
app.put('/:id', async (req, res) => {
  await Event.findOneAndUpdate({ _id: ObjectId(req.params.id)}, req.body )
  res.send({ message: 'Event updated.' });
});

// starting the server
app.listen(3001, () => {
  console.log('listening on port 3001');
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("Database connected!")
});
