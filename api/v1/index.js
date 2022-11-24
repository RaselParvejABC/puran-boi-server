const express = require("express");
const apiV1Router = express.Router();

//Importing Routers
const categoriesRouter = require("./routers/categories");
const productsRouter = require("./routers/products");
const purchaseRequestsRouter = require("./routers/purchase-requests");
const reportsRouter = require("./routers/reports");
const usersRouter = require("./routers/users");


apiV1Router.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1!");
});

apiV1Router.use("/categories", categoriesRouter);
apiV1Router.use("/products", productsRouter);
apiV1Router.use("/purchase-requests", purchaseRequestsRouter);
apiV1Router.use("/reports", reportsRouter);
apiV1Router.use("/users", usersRouter);

module.exports = apiV1Router;
