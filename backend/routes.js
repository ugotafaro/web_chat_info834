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

router.post('/new-message',messageController.new_message);
router.get('/get-conversation',messageController.get_conversation);
router.delete('delete-message',messageController.delete_message);
router.delete('/delete-conversation',messageController.delete_conversation);
router.post('add-receiver',messageController.add_receiver);
router.delete('leave-conversation',messageController.leave_conversation);
router.put('refractor-conversation-name',messageController.refractor_conversation_name);

module.exports = router;