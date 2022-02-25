/// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { Event } = require("./models/eventSchema");
const { User } = require("./models/userSchema");
const bcrypt = require("bcryptjs");

mongoose.connect(
  "mongodb+srv://Lingqizhu:Peggy1980122@cluster0.k9dxo.mongodb.net/Event?retryWrites=true&w=majority"
);

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.post("/register", async (req, res) => {
  const newPassword = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    userName: req.body.userName,
    password: newPassword,
  });
  await user.save();
  res.send({ status: "ok" });
});

app.post("/auth", async (req, res) => {
  const user = await User.findOne({ userName: req.body.userName });
  if (!user) {
    return res.sendStatus(401);
  }
  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (isPasswordValid) {
    user.token = uuidv4();
    await user.save();
    res.send({ token: user.token });
  } else {
    return res.sendStatus(404);
  }
});

app.use(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const user = await User.findOne({ token: authHeader });

  if (user) {
    next();
  } else {
    res.sendStatus(403);
  }
});

app.get('/userlist',function(req,res){
  User.find().then((users) => res.send(users))
});

app.get("/", function (req, res) {
  Event.find().then((events) => res.send(events));
});

//search by location
app.get("/location/:location", async (req, res) => {
  res.send(await Event.find({ location: req.params.location }));
});

app.get("/name/:name", async (req, res) => {
  res.send(await Event.find({ name: req.params.name }));
});

// create new event
app.post("/", async (req, res) => {
  const newEvent = req.body;
  const event = new Event(newEvent);
  await event.save();
  res.send({ message: "New event inserted." });
});

// delete event
app.delete("/delete/:id", async (req, res) => {
  await Event.deleteOne({ _id: ObjectId(req.params.id) });
  res.send({ message: "Event removed." });
});

// update event
app.put("/update/:id", async (req, res) => {
  await Event.findOneAndUpdate({ _id: ObjectId(req.params.id) }, req.body);
  res.send({ message: "Event updated." });
});

// starting the server
app.listen(3000, () => {
  console.log("listening on port 3000");
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Database connected!");
})