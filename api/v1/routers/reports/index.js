const express = require("express");
const reportsRouter = express.Router();

reportsRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Reports!");
});

module.exports = reportsRouter;
