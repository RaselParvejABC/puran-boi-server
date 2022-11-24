const express = require("express");
const categoriesRouter = express.Router();

const {categoriesCollection} = require("../../services/mongodb");

categoriesRouter.get("/", async (req, res) => {
  await categoriesCollection.find().toArray();
  res.send("Hello, I am Puran Boi v1 Catergories!");
});

module.exports = categoriesRouter;
