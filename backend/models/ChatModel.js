const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatsSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  users: [
    {
      _id: mongoose.Types.ObjectId,
      username: String,
    }
  ],
  messages: [
    {
      content: String,
      sender: String,
      createdAt: Date,
      updatedAt: Date
    }
  ]
});

const Chat = mongoose.model('Chat', chatsSchema);

module.exports = Chat;
