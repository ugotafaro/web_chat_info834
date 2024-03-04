const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  name: {
    type:String,
    required:true,
  },

  users: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid user ID',
    }
  }]
},
{ collection: 'conversations' });

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;