//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Get up",
});
const item2 = new Item({
  name: "Fresh up",
});
const item3 = new Item({
  name: "Start Coding",
});

const defaultItems = [item1, item2, item3];

console.log(Item.find({}));

app.get("/", function (req, res) {
  res.render("list", { listTitle: "Today", newListItems: items });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  if (item) {
    items.push(item);
  }

  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("work", { listTitle: "Work List", newListItems: workItems });
});
app.post("/work", function (req, res) {
  const item = req.body.newItem;
  if (item) {
    workItems.push(item);
  }

  res.redirect("/work");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
