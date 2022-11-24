const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Requiring/Importing Routers
const apiV1 = require("./api/v1");

//Initializing Express
const app = express();
const port = 5000;

//Global Middleware
app.use(
  cors({
    origin: [
      process.env.NODE_ENV !== "production" && "http://localhost:5173",
      "https://puran-boi.web.app/",
      "https://puran-boi.firebaseapp.com/",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Puran Boi is here to Serve with Joy!");
});

//Delegating to Routers
app.use("/api/v1", apiV1);

// Start Listening for Request
app.listen(port, () => {
  console.log(`Puran Boi Server is listening on port ${port}`);
});
