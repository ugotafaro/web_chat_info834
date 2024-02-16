const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  done: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid ObjectId',
    }
  },
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    valide: {
      validator: (value) => ObjectId.isValid(value),
      message: 'Invalid ObjectId',
    }
  }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;