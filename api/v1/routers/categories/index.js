const express = require("express");
const categoriesRouter = express.Router();

const { categoriesCollection } = require("../../services/mongodb");

categoriesRouter.get("/", async (req, res) => {
  try {
    const categories = await categoriesCollection.find().toArray();
    res.json(categories);
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = categoriesRouter;
