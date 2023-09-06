const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb://localhost:27017/todolistDB")
  .then(() => console.log("DB connection successfull"))
  .catch(() => console.log("Unable to connedt to DB"));

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to new Todo List",
});
const item2 = new Item({
  name: "Press + button to add new Task",
});
const item3 = new Item({
  name: "<-- Click this  to remove the  task",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("list", listSchema);
app.get("/", async (req, res) => {
  try {
    // Retrieve data from MongoDB using Mongoose
    const items = await Item.find({});

    if (items.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      // Render the "list" template with the retrieved data
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).send("Error retrieving data");
  }
});

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    newItem.save().then(() => console.log("Item Saved Successfully"));
    res.redirect("/");
  } else {
    await List.findOne({ name: listName }).then((data) => {
      data.items.push(newItem);
      data.save();
      console.log("Item Saved Successfully");
    });
    res.redirect(`/${listName}`);
  }
});

//Custom list for custom routes by limiting only one list for one route

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  await List.findOne({ name: customListName })
    .then((data) => {
      if (!data) {
        // if no list founds in the DB creating one with some default items

        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect(`/${customListName}`);
      } else {
        res.render("list", { listTitle: data.name, newListItems: data.items });
      }
    })
    .catch((err) => console.log(err));
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    await Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Record Removed Successfully");
      })
      .catch((err) => console.log("Error:", err));

    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(() => {
        console.log("Record Removed Successfully");
      })
      .catch((err) => console.log("Error:", err));

    res.redirect(`/${listName}`);
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
