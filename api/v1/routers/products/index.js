const express = require("express");
const { ObjectId } = require("mongodb");
const {
  productsCollection,
  usersCollection,
  reportsCollection,
  purchaseRequestsCollection,
  categoriesCollection,
} = require("../../services/mongodb");
const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  res.send("Hello, I am Puran Boi v1 Products!");
});

// Add New Product
productsRouter.post("/", async (req, res) => {
  const reqBody = req.body;
  try {
    const userDoc = await usersCollection.findOne(
      {
        firebaseUID: reqBody.sellerFirebaseUID,
      },
      {
        projection: {
          _id: 1,
        },
      }
    );
    reqBody.sellerUserID = userDoc._id;
    reqBody.addTimestamp = new Date().getTime();
    reqBody.categoryID = new ObjectId(reqBody.categoryID);
    delete reqBody.sellerFirebaseUID;
    await productsCollection.insertOne(reqBody);
  } catch (err) {
    console.error(err);
    res.json({ success: false });
    return;
  }

  res.json({ success: true });
});

//Get Products of a seller
productsRouter.get("/my-products/:firebaseUID", async (req, res) => {
  const firebaseUID = req.params.firebaseUID;
  try {
    const result = await usersCollection
      .aggregate([
        {
          $match: {
            firebaseUID: firebaseUID,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "sellerUserID",
            as: "products",
            pipeline: [
              {
                $sort: {
                  addTimestamp: -1,
                },
              },
              {
                $project: {
                  _id: 1,
                  productTitle: 1,
                  priceInBDT: 1,
                  productPBStatus: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();
    res.send(result[0]["products"]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

//Delete a product
productsRouter.delete("/:productID", async (req, res) => {
  const productID = new ObjectId(req.params.productID);
  try {
    await reportsCollection.deleteMany({
      productID: productID,
    });
    await purchaseRequestsCollection.deleteMany({
      productID: productID,
    });
    await productsCollection.deleteOne({
      _id: productID,
    });
    res.json({ success: true });
    return;
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

//New Advertisement
productsRouter.post("/ads/:productID", async (req, res) => {
  const productID = new ObjectId(req.params.productID);
  try {
    await productsCollection.updateOne(
      {
        _id: productID,
        productPBStatus: "notAdvertising",
      },
      {
        $set: {
          productPBStatus: "advertising",
          advertisingTimestamp: new Date().getTime(),
        },
      }
    );
    res.json({ success: true });
    return;
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Recent Ads for Client Home
productsRouter.get("/ads/recent", async (req, res) => {
  try {
    const result = await productsCollection
      .aggregate([
        {
          $match: {
            productPBStatus: "advertising",
          },
        },
        {
          $sort: {
            addTimestamp: -1,
          },
        },
        {
          $limit: 3,
        },
        {
          $lookup: {
            from: "users",
            localField: "sellerUserID",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  sellerName: "$name",
                  isSellerVerified: "$isVerifiedSeller",
                },
              },
            ],
            as: "seller",
          },
        },
        {
          $unwind: "$seller",
        },
      ])
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Ads under a category
productsRouter.get("/ads/:categoryID", async (req, res) => {
  const categoryID = new ObjectId(req.params.categoryID);
  try {
    const categoryDoc = await categoriesCollection.findOne({
      _id: categoryID,
    });
    const result = await productsCollection
      .aggregate([
        {
          $match: {
            productPBStatus: "advertising",
            categoryID: categoryID,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "sellerUserID",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  sellerName: "$name",
                  isSellerVerified: "$isVerifiedSeller",
                },
              },
            ],
            as: "seller",
          },
        },
        {
          $unwind: "$seller",
        },
      ])
      .toArray();
    categoryDoc["products"] = result;
    res.json(categoryDoc);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = productsRouter;
