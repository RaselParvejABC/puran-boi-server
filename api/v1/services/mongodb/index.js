const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@mrp.nrrcot5.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

mongoClient.on("connectionCreated", () => {
  console.log("Hello from Mongo!");
});

const categoriesCollection = mongoClient
  .db("puranBoiDB")
  .collection("categories");
const productsCollection = mongoClient.db("puranBoiDB").collection("products");
const purchaseRequestsCollection = mongoClient
  .db("puranBoiDB")
  .collection("purchaseRequests");
const reportsCollection = mongoClient.db("puranBoiDB").collection("reports");
const usersCollection = mongoClient.db("puranBoiDB").collection("users");

const getMongoClient = () => {
  return mongoClient;
};

module.exports = {
  getMongoClient,
  categoriesCollection,
  productsCollection,
  purchaseRequestsCollection,
  reportsCollection,
  usersCollection,
};
