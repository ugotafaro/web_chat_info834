const express = require('express');
const router = express.Router();

// Controller
const taskController = require('./controllers/TaskController');
const authController = require('./controllers/AuthController');

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

module.exports = router;