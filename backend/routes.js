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

const leave_conversation = async (req, res) => {
  try {
    const updatedConversation = await messageController.leave_conversation(req.body);
    return res.json({ message: 'User removed from the conversation', data: updatedConversation });
  } catch (error) {
    return handleErrors(res, 400, error.message);
  }
};

const search_users = async (req, res) => {
  try {
    const users = await userController.search_users(req.body);
    return res.json({ message: `Found ${users.length} users`, data: users });
  } catch (error) {
    return handleErrors(res, 400, error.message);
  }
};



const new_message = async (req, res) => {
    try {
      const { content, sender, conversation } = req.body;
      const createdMessage = await messageController.new_message(content, sender, conversation);
      return res.json({ message: 'Message created successfully', data: createdMessage });
    } catch (error) {
      return handleErrors(res, 400, error.message);
    }
};

// Routes

// Users
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', AuthGuard, authController.logout);
router.get('/user/:id', userController.get);
router.get('/search-users', search_users);

// Messages
router.post('/new-message', new_message);
router.delete('/delete-message',messageController.delete_message);

// Conversations
router.get('/get-conversation',messageController.get_conversation);
router.get('/get-conversations', get_conversations);
router.post('/new-conversation', new_conversation);
router.delete('/delete-conversation',messageController.delete_conversation);
router.put('/join-conversation', join_conversation);
router.delete('/leave-conversation', leave_conversation);
router.put('/rename-conversation',messageController.rename_conversation);

module.exports = router;