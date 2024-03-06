const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: {
    type:String,
    required:true,
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid ObjectId',
    }
  },

  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid conversation ID',
    }
  },
},
{
  timestamps: true
},
{ collection: 'messages' });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;