const express = require("express");
const { ObjectId } = require("mongodb");
const {
  productsCollection,
  usersCollection,
} = require("../../services/mongodb");
const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  res.send("Hello, I am Puran Boi v1 Products!");
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

// Recent Ads on Client Home
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
            advertisingTimestamp: -1,
          },
        },
      ])
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = productsRouter;
