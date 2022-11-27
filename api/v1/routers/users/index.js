const express = require("express");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const {
  usersCollection,
  reportsCollection,
  purchaseRequestsCollection,
} = require("../../services/mongodb");
const usersRouter = express.Router();

usersRouter.get("/:firebaseUID/type", async (req, res) => {
  const uid = req.params.firebaseUID;
  let doc;
  try {
    doc = await usersCollection.findOne(
      { firebaseUID: uid },
      {
        projection: {
          _id: 0,
          userType: 1,
        },
      }
    );
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    return;
  }

  res.json(doc);
});

usersRouter.get("/grant-token/:firebaseUID", async (req, res) => {
  const uid = req.params.firebaseUID;
  let doc;
  try {
    doc = await usersCollection.findOne(
      { firebaseUID: uid },
      {
        projection: {
          _id: 0,
          isVerifiedSeller: 1,
          userType: 1,
          firebaseUID: 1,
          addTimestamp: 1,
        },
      }
    );
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    return;
  }
  const payload = { token: doc, tokenTimestamp: new Date().getTime() };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  res.cookie("token", token, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 86_400_000,
    sameSite: "none",
  });
  res.json({ success: true });
});

usersRouter.post("/new-sign-in", async (req, res) => {
  const reqBody = req.body;
  const isSeller = reqBody["isSeller"] || false;
  //Above Line is Effective only First Time with same Firebase UID
  const firebaseUID = reqBody["firebaseUID"];
  delete reqBody["isSeller"];
  delete reqBody["firebaseUID"];

  const filter = { firebaseUID: firebaseUID };
  const options = { upsert: true };
  const updateDoc = {
    $set: reqBody,
    $setOnInsert: {
      firebaseUID: firebaseUID,
      isVerifiedSeller: false,
      addTimestamp: new Date().getTime(),
      userType: isSeller ? "seller" : "buyer",
    },
  };

  try {
    await usersCollection.updateOne(filter, updateDoc, options);
    res.json({ success: true });
    return;
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

usersRouter.delete("/revoke-token", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    maxAge: 86_400_000,
  });
  res.json({ success: true });
});

usersRouter.get("/:firebaseUID/product/:productID", async (req, res) => {
  const firebaseUID = req.params.firebaseUID;
  const productID = new ObjectId(req.params.productID);

  try {
    const { _id: userID } = await usersCollection.findOne({
      firebaseUID: firebaseUID,
    });

    const report = await reportsCollection.findOne({
      reporterUserID: userID,
      productID: productID,
    });

    const purchaseRequest = await purchaseRequestsCollection.findOne({
      buyerUserID: userID,
      productID: productID,
    });

    res.json({ requested: !!purchaseRequest, reported: !!report });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = usersRouter;
