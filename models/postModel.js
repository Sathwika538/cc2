const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: {
      public_id:String,
      url      :String,
    },
    namee: String,
  });

module.exports = mongoose.model("Post", postSchema);
