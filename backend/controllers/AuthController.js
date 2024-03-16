const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { client } = require('../redis.js');
const User = require('../models/UserModel.js');
const { handleErrors, handleLoginErrors } = require('../util.js');

// Time span for login fail to be considered as "recent" (in ms)
const FAIL_SPAN = 5 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

const signup = async (req, res) => {
    const { username, password, lastname, firstname } = req.body;

    // Check if credentials are given
    if (!username || !password) return handleErrors(res, 401, 'Username and password are required');

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    const timestamp = new Date().toISOString();
    const jsonIfError = {timestamp, success: false};
    if (existingUser) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'User already exists'}));
        return handleErrors(res, 409, 'User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, lastname, firstname, password: hashedPassword});

    // Save the user in MongoDB and check for errors
    try {
        await newUser.save();
    } catch (err) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'Error saving user in database'}));
        return handleErrors(res, 500, 'Error saving user in database');
    }

    // Generate a JWT and save it
    const token = jwt.sign({ userId: newUser._id }, 'secret-key', { expiresIn: '1h' });
    newUser.token = token;
    await newUser.save();

    // Save user and login success in Redis
    client.hSet(`user:${newUser._id}`, {username, token, timestamp});
    client.lPush(`login-attempts:${username}`, JSON.stringify({timestamp, success: true}));

    // Respond but without the user password
    res.json({ message: 'User created', user: { username, lastname, firstname, token, id: newUser._id } });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    // Check if credentials are given
    if (!username || !password) return handleErrors(res, 400, 'Username and password are required');

    // Get current time and threshold (FAIL_SPAN milliseconds ago)
    const timestamp = new Date();
    const threshold = timestamp.getTime() - FAIL_SPAN;

    // Prepare a JSON object to store in Redis in case of error
    const jsonIfError = {timestamp: timestamp.toISOString(), success: false};

    // Get the login attempts from Redis
    const attempts = await client.lRange(`login-attempts:${username}`, 0, -1);

    // Get number of failed attempts in the last 5 minutes
    const numberFails = attempts.filter((attempt) => {
        const data = JSON.parse(attempt);
        return !data.success && new Date(data.timestamp).getTime() >= threshold;
    }).length;

    // Check number of failed attempts
    if (numberFails + 1 >= MAX_LOGIN_ATTEMPTS) {
        // TODO : Ajouter le fail dans Redis ?
        // client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'Too many failed attempts'}));
        return handleLoginErrors(res, 429, 'Too many failed attempts', numberFails, FAIL_SPAN, MAX_LOGIN_ATTEMPTS);
    }

    // Get user
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'User not found'}));
        return handleLoginErrors(res, 401, 'Invalid credentials', numberFails + 1, FAIL_SPAN, MAX_LOGIN_ATTEMPTS);
    };

    // Check if user already logged in in Redis
    const userInRedis = await client.exists(`user:${user._id}`);
    if (userInRedis) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'Already logged in'}));
        return handleLoginErrors(res, 409, 'User already logged in', numberFails + 1, FAIL_SPAN, MAX_LOGIN_ATTEMPTS);
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'Invalid password'}));
        return handleLoginErrors(res, 401, 'Invalid credentials', numberFails + 1, FAIL_SPAN, MAX_LOGIN_ATTEMPTS);
    }

    // Succes ! Generate and save a token
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    // Save user and login success in Redis
    client.hSet(`user:${user._id}`, {username, token, timestamp: timestamp.toISOString()});
    client.lPush(`login-attempts:${username}`, JSON.stringify({timestamp: timestamp.toISOString(), success: true}));

    // Respond but without the user password
    res.json({ message: 'Login successful', user: { username, lastname: user.lastname, firstname: user.firstname, token, id: user._id } });
};

const logout = async (req, res) => {
    // Remove the user in Redis
    client.del(`user:${req.user.id}`);

    // Respond with a successful logout message
    res.json({ message: 'Logout successful' });
};

module.exports = {
    signup,
    login,
    logout,
};