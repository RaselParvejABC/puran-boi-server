const express = require("express");
const productsRouter = express.Router();

productsRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Products!");
});

module.exports = productsRouter;
