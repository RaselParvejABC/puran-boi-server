const express = require("express");
const { ObjectId } = require("mongodb");
const {
  reportsCollection,
  usersCollection,
} = require("../../services/mongodb");
const checkJWTToken = require("../../helpers");
const reportsRouter = express.Router();

reportsRouter.get("/unresolved", checkJWTToken, async (req, res) => {
  try {
    const result = await reportsCollection
      .aggregate([
        {
          $match: {
            status: "unresolved",
          },
        },
        { $sort: { addTimestamp: -1 } },
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
                },
              },
            ],
          },
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "users",
            localField: "reporterUserID",
            foreignField: "_id",
            as: "reporter",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  name: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        { $unwind: "$reporter" },
      ])
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

reportsRouter.post(
  "/user/:firebaseUID/product/:productID",
  async (req, res) => {
    const firebaseUID = req.params.firebaseUID;
    const productID = new ObjectId(req.params.productID);

    try {
      const { _id: reporterUserID } = await usersCollection.findOne({
        firebaseUID: firebaseUID,
      });

      await reportsCollection.insertOne({
        reporterUserID: reporterUserID,
        productID: productID,
        status: "unresolved",
        addTimestamp: new Date().getTime(),
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);

reportsRouter.patch("/mark-resolved/:id", checkJWTToken, async (req, res) => {
  try {
    const reportID = new ObjectId(req.params.id);
    await reportsCollection.updateOne(
      { _id: reportID },
      { $set: { status: "resolved" } }
    );
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = reportsRouter;
