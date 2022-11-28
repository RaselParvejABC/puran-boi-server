const express = require("express");
const { ObjectId } = require("mongodb");
const checkJWTToken = require("../../helpers");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const {
  usersCollection,
  purchaseRequestsCollection,
  productsCollection,
} = require("../../services/mongodb");
const purchaseRequestsRouter = express.Router();

purchaseRequestsRouter.get("/", (req, res) => {
  res.send("Hello, I am Puran Boi v1 Purchase Requests!");
});

purchaseRequestsRouter.patch("/reject/:purchaseRequestID", async (req, res) => {
  try {
    const purchaseRequestID = new ObjectId(req.params.purchaseRequestID);
    await purchaseRequestsCollection.updateOne(
      {
        _id: purchaseRequestID,
      },
      {
        $set: {
          status: "rejected",
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

purchaseRequestsRouter.patch(
  "/accept/:purchaseRequestID/product/:productID",
  async (req, res) => {
    try {
      const purchaseRequestID = new ObjectId(req.params.purchaseRequestID);
      const productID = new ObjectId(req.params.productID);
      await purchaseRequestsCollection.findOneAndUpdate(
        {
          _id: purchaseRequestID,
        },
        {
          $set: {
            status: "accepted",
          },
        }
      );
      await productsCollection.updateOne(
        { _id: productID },
        {
          $set: {
            productPBStatus: "awaitingPayment",
          },
        }
      );
      res.json({ success: true });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
);

purchaseRequestsRouter.get(
  "/from/:firebaseUID",
  checkJWTToken,
  async (req, res) => {
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
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
);

purchaseRequestsRouter.get("/to/:firebaseUID", async (req, res) => {
  try {
    const firebaseUID = req.params.firebaseUID;
    const { _id: sellerUserID } = await usersCollection.findOne({
      firebaseUID: firebaseUID,
    });
    const myProducts = await productsCollection
      .aggregate([
        {
          $match: {
            sellerUserID: sellerUserID,
            productPBStatus: {
              $nin: ["notAdvertising"],
            },
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
      ])
      .toArray();

    const purchaseRequestsToMe = await purchaseRequestsCollection
      .aggregate([
        {
          $match: {
            productID: {
              $in: myProducts.map((product) => product._id),
            },
            status: {
              $nin: ["rejected"],
            },
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
                  priceInBDT: 1,
                  productPBStatus: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "users",
            localField: "buyerUserID",
            foreignField: "_id",
            as: "buyer",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$buyer",
        },
      ])
      .toArray();
    res.json(purchaseRequestsToMe);
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

purchaseRequestsRouter.get(
  "/stripe-client-secret/:amount",
  checkJWTToken,
  async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(req.params.amount),
        currency: "usd",
      });
      res.json({
        stripeClientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
);

module.exports = purchaseRequestsRouter;
