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
      .find({ status: "unresolved" }, { sort: { addTimestamp: -1 } })
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

module.exports = reportsRouter;
