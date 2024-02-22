const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation_name: {
    type:String,
    required:false,
  },
  content: {
    type:String,
    required:true,
  },
  date:{
    type:Date,
    required:false,
  },
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid ObjectId',
    }
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid ObjectId',
    }
  },
  receivers: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid ObjectId',
    }
  }],
  
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;