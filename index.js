//imports
const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

//models
const User = require("./models/User");
const Favorite = require("./models/Favourites");

//api endpoints
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(cookieParser());

//Database connection:
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => console.log(err));

//API Endoints:
//the registration endpoint to register the user
app.post("/register", async (req, res) => {
  try {
    const { name, surname, username, password } = req.body;
    const userData = {
      name: name,
      surname: surname,
      username: username,
      password: password,
    };
    const updatedUser = await User.create(userData, { new: true });

    res.json(updatedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
//authenticate user
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = { username: username, password: password };
    const userLog = await User.findOne(userData);
    if (!userLog) {
      return res.status(403).send("Invalid login credentials");
    }

    if (
      userData.password === userLog.password &&
      userData.username === userLog.username
    ) {
      res.status(200).json("authenticated");
    } else {
      res.status(403).send("Invalid login credentials");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//the endpoint to add a favourite coin
//the endpoint to add a favourite coin
app.post("/addfavourite", async (req, res) => {
  try {
    const { coin, username } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const updateFavourite = await Favorite.findOneAndUpdate(
      { userId: user._id },
      { $push: { favourites: coin } },
      { new: true, upsert: true }
    );
    res.json(updateFavourite);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//the endpoint to get the favourite coins of the user
// app.get("/getFavourite", async (req, res) => {
//   try {
//     const { name, surname, username, password } = req.body;
//     const userData = {
//       name: name,
//       surname: surname,
//       username: username,
//       password: password,
//     };
//     const updatedUser = await User.create(userData, { new: true });

//     res.json(updatedUser);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  //see whats is the token , the default should be Bearer token, we are splitting the bearer and the token apart using the space between
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userLog) => {
    if (err) return res.status(403);
    req.userLog = userLog;
    next();
  });
}
function generateToken(userLog) {
  return jwt.sign(userLog, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
}

//NewsAPI to get articles for the newstab in the frontend
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(`${process.env.NEWS_KEY}`);

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
