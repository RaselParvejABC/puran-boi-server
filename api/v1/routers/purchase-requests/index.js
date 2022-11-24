const express = require("express");
const purchaseRequestsRouter = express.Router();

purchaseRequestsRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Purchase Requests!");
});

module.exports = purchaseRequestsRouter;
