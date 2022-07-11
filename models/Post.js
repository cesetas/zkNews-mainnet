const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  news: String,
  photoURL: String,
  likes: String,
  dislikes: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.models.Post || mongoose.model("Post", PostSchema);

// likes: {
//   type: [String],
//   default: [],
// },
// dislikes: {
//   type: [String],
//   default: [],
// },
