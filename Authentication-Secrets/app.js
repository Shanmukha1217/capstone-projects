//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const hostDB = process.env.MONGO_DB_URL;
mongoose
  .connect(`${hostDB}/userDB`)
  .then(() => {
    console.log("DB connection successfull");
  })
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", async (req, res) => {
  // res.send("I'm here");

  res.render("home");
});

app.get("/register", async (req, res) => {
  res.render("register");
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });

    newUser
      .save()
      .then(() => {
        console.log("User added to DB");
        res.render("secrets");
      })
      .catch((err) => res.send(err));
  });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  await User.findOne({ email: username })
    .then((foundUser) => {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      } else {
        res.send("No Credentials found");
      }
    })
    .catch((err) => res.send(err));
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
