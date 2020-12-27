const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  writer: { type: String, required: true },
  hit: { type: Number, required: true, default: 0 },
  createAt: { type: Date, required: true, default: () => new Date() },
  updateAt: { type: Date, required: true, default: () => new Date() },
  comments: [{ 
      content: { type: String, required: true },
      writer: { type: String, required: true},
      writer_name: {type : String, required: false},
      createAt: { type: String, required: true, default: () => new Date() },
      isEdited: { type: Boolean, required: true, default: false }
    }]
});

const Post = mongoose.model('post', postSchema);

module.exports = Post;