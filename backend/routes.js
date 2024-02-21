const express = require('express');
const router = express.Router();

// Controller
const taskController = require('./controllers/TaskController');
const authController = require('./controllers/AuthController');
const userController = require('./controllers/UserController');

// Middleware
const auth_guard = require('./middlewares/authentificate');

// Routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', auth_guard, authController.logout);

router.post('/user/:id', auth_guard, userController.get);

module.exports = router;