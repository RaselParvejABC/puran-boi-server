const express = require("express");
const { ObjectId } = require("mongodb");
const {
  usersCollection,
  purchaseRequestsCollection,
} = require("../../services/mongodb");
const purchaseRequestsRouter = express.Router();

purchaseRequestsRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Purchase Requests!");
});

purchaseRequestsRouter.get("/from/:firebaseUID", async (req, res) => {
  try {
    const firebaseUID = req.params.firebaseUID;
    const { _id: buyerUserID } = await usersCollection.findOne({
      firebaseUID: firebaseUID,
    });
    const myPurchaseRequests = await purchaseRequestsCollection
      .aggregate([
        {
          $match: {
            buyerUserID: buyerUserID,
          },
        },
        {
          $sort: {
            addTimestamp: -1,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productID",
            foreignField: "_id",
            as: "product",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  productTitle: 1,
                  productImage: 1,
                  priceInBDT: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$product",
        },
      ])
      .toArray();
    res.json(myPurchaseRequests);
    console.log(myPurchaseRequests);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

purchaseRequestsRouter.post("/", async (req, res) => {
  try {
    const reqBody = req.body;
    const buyerFirebaseUID = reqBody.buyerFirebaseUID;
    const { _id: buyerUserID } = await usersCollection.findOne({
      firebaseUID: buyerFirebaseUID,
    });
    delete reqBody.buyerFirebaseUID;
    reqBody.buyerUserID = buyerUserID;
    reqBody.addTimestamp = new Date().getTime();
    reqBody.productID = new ObjectId(reqBody.productID);

    await purchaseRequestsCollection.insertOne(reqBody);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = purchaseRequestsRouter;
