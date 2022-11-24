const express = require("express");
const categoriesRouter = express.Router();

categoriesRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Catergories!");
});

module.exports = categoriesRouter;
