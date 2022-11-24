const express = require("express");
const categoriesRouter = express.Router();

const { categoriesCollection } = require("../../services/mongodb");

categoriesRouter.get("/", async (req, res) => {
  const categories = await categoriesCollection.find().toArray();
  res.json(categories);
});

module.exports = categoriesRouter;
