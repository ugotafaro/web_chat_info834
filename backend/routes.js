const express = require('express');
const router = express.Router();

// Controller
const taskController = require('./controllers/TaskController');
const authController = require('./controllers/AuthController');
const messageController = require('./controllers/MessageController');
// Middleware
const authenticate = require('./middlewares/authentificate');

// Routes
router.post('/tasks', taskController.get_many);
router.get('/task/:id', taskController.get);

router.post('/categories', taskController.all_categories);
router.post('/delete-category', taskController.delete_category);

router.post('/add-task', taskController.add_task);
router.post('/toggle-task/:id', taskController.toggle);
router.post('/delete-task', taskController.delete_task);

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authenticate, authController.logout);

// Messages
router.post('/new-message',messageController.new_message);
router.delete('/delete-message',messageController.delete_message);

// Conversations
router.get('/get-conversation',messageController.get_conversation);
router.get('/get-conversations',messageController.get_conversations);
router.delete('/delete-conversation',messageController.delete_conversation);
router.put('/join-conversation',messageController.join_conversation);
router.delete('/leave-conversation',messageController.leave_conversation);
router.put('/rename-conversation',messageController.rename_conversation);

module.exports = router;