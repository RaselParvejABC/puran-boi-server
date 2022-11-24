const express = require("express");
const usersRouter = express.Router();

usersRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Users!");
});

module.exports = usersRouter;
