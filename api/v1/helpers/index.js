const jwt = require("jsonwebtoken");
const { usersCollection } = require("../services/mongodb");

const checkJWTToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.sendStatus(401);
    return;
  }
  console.log("Token1", token);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    decodedToken = decodedToken.token;
  } catch (err) {
    res.sendStatus(400);
    return;
  }

  const userDoc = await usersCollection.findOne({
    firebaseUID: decodedToken.firebaseUID,
  });
  if (userDoc) {
    next();
  } else {
    res.sendStatus(403);
  }
};

module.exports = checkJWTToken;
