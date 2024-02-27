const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { client } = require('../redis.js');

const User = require('../models/UserModel.js');
const { handleErrors } = require('../util.js');

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


    res.json({ message: 'Signup successful', token, user: newUser._id });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    // Check if credentials are given
    if (!username || !password) return handleErrors(res, 401, 'Username and password are required');

    // Check if user exists in MongoDB
    const user = await User.findOne({ username });
    const timestamp = new Date().toISOString();
    const jsonIfError = {timestamp, success: false};

    if (!user) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'User not found'}));
        return handleErrors(res, 401, 'Invalid credentials');
    };

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        client.lPush(`login-attempts:${username}`, JSON.stringify({...jsonIfError, message: 'Invalid password'}));
        return handleErrors(res, 401, 'Invalid credentials');
    }

    // Succes ! Generate and save a token
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    // Prepare a JSON object to store in Redis
    const userJson = {username, token, timestamp:  new Date().toISOString()};

    // Save user and login success in Redis
    client.hSet(`user:${user._id}`, userJson);
    client.lPush(`login-attempts:${username}`, JSON.stringify({timestamp, success: true}));

    res.json({ message: 'Login successful', token, user: user._id });
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