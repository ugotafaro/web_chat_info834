const express = require('express');
const router = express.Router();
const { handleErrors } = require('./util.js');

// Controller
const authController = require('./controllers/AuthController');
const userController = require('./controllers/UserController');
const messageController = require('./controllers/MessageController');

// Middleware
const AuthGuard = require('./middlewares/authentificate');

// Adapters
const new_message = async (req, res) => {
    try {
      const createdMessage = await messageController.new_message(req.body);
      return res.json({ message: 'Message created successfully', data: createdMessage });
    } catch (error) {
      return handleErrors(res, 400, error.message);
    }
};

const get_conversations = async (req, res) => {
    try {
      const conversations = await messageController.get_conversations(req.query);
      return res.json({ message: 'Conversations retrieved successfully', data: conversations });
    } catch (error) {
      return handleErrors(res, 400, error.message);
    }
};

const join_conversation = async (req, res) => {
    try {
      const updatedConversation = await messageController.join_conversation(req.body);
      return res.json({ message: 'User added to conversation', data: updatedConversation });
    } catch (error) {
      return handleErrors(res, 400, error.message);
    }
};

const new_conversation = async (req, res) => {
  try {
    const createdConversation = await messageController.new_conversation(req.body);
    return res.json({ message: 'Conversation created successfully', data: createdConversation });
  } catch (error) {
    return handleErrors(res, 400, error.message);
  }
};

// Routes

// Users
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', AuthGuard, authController.logout);
router.post('/user/:id', AuthGuard, userController.get);
router.get('/search-user', userController.search_user);

// Messages
router.post('/new-message', new_message);
router.delete('/delete-message',messageController.delete_message);

// Conversations
router.get('/get-conversation',messageController.get_conversation);
router.get('/get-conversations', get_conversations);
router.post('/new-conversation', new_conversation);
router.delete('/delete-conversation',messageController.delete_conversation);
router.put('/join-conversation', join_conversation);
router.delete('/leave-conversation',messageController.leave_conversation);
router.put('/rename-conversation',messageController.rename_conversation);

module.exports = router;