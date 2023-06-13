const express = require("express");
const bodyParser = require("body-parser");
const connectdb = require("./../database");
const Chats = require("../models/chat");

const router = express.Router();

router.route("/gaming").get((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;

  connectdb.then(db => {
    let data = Chats.find({ message: "Anonymous" });
    Chats.find({}).then(chat => {
      res.json(chat);
    });
  });
});

module.exports = router;
