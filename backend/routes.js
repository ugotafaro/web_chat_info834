const express = require('express');
const router = express.Router();

// Controller
const taskController = require('./controllers/TaskController');
const authController = require('./controllers/AuthController');
const userController = require('./controllers/UserController');

// Middleware
const auth_guard = require('./middlewares/authentificate');

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
router.post('/logout', auth_guard, authController.logout);

router.post('/user/:id', auth_guard, userController.get);

module.exports = router;