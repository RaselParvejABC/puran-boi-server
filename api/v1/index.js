const express = require("express");
const apiV1Router = express.Router();

//Importing Routers
const categoriesRouter = require("./routers/categories");
const productsRouter = require("./routers/products");
const purchaseRequestsRouter = require("./routers/purchase-requests");
const reportsRouter = require("./routers/reports");
const usersRouter = require("./routers/users");
const { usersCollection, productsCollection } = require("./services/mongodb");

apiV1Router.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1!");
});

apiV1Router.get("/stats", async (req, res) => {
  try {
    const numberOfUsers = await usersCollection.countDocuments();
    const numberOfProducts = await productsCollection.countDocuments();
    const numberOfAds = await productsCollection.countDocuments();
    res.json({ numberOfAds, numberOfProducts, numberOfUsers });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

apiV1Router.use("/categories", categoriesRouter);
apiV1Router.use("/products", productsRouter);
apiV1Router.use("/purchase-requests", purchaseRequestsRouter);
apiV1Router.use("/reports", reportsRouter);
apiV1Router.use("/users", usersRouter);

module.exports = apiV1Router;
