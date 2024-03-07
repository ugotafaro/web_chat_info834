const express = require('express');
const router = express.Router();

// Controller
const authController = require('./controllers/AuthController');
const userController = require('./controllers/UserController');
const messageController = require('./controllers/MessageController');

// Middleware
const AuthGuard = require('./middlewares/authentificate');

const new_message = async (req, res) => {
    try {
      const { content, sender, conversation } = req.body;
      const createdMessage = await messageController.new_message(content, sender, conversation);
      return res.json({ message: 'Message created successfully', data: createdMessage });
    } catch (error) {
      return handleErrors(res, 400, error.message);
    }
};

const get_conversations = async (req, res) => {
    try {
      let user = req.query.user;
      const conversations = await messageController.get_conversations(user);
      return res.json({ message: 'Conversations retrieved successfully', data: conversations });
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
router.delete('/delete-conversation',messageController.delete_conversation);
router.put('/join-conversation',messageController.join_conversation);
router.delete('/leave-conversation',messageController.leave_conversation);
router.put('/rename-conversation',messageController.rename_conversation);

module.exports = router;