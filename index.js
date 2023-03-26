//imports
const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//api endpoints
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.options("*", cors());

const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("6ff601330e154db7bff9950546ba240e");

app.get("/news", (req, res) => {
  newsapi.v2
    .everything({
      q: "crypto",
      language: "en",
    })
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Error fetching news" });
    });
});

app.listen(3001, () => {
  console.log("Server started successfully");
});
