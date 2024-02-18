const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { client } = require('../redis.js');

const User = require('../models/UserModel.js');
const { handleErrors } = require('../util.js');

const signup = async (req, res) => {
    const { username, password } = req.body;

    // Check if credentials are given
    if (!username || !password) return handleErrors(res, 401, 'Username and password are required');

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return handleErrors(res, 409, 'User already exists');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username: username, password: hashedPassword });
    await newUser.save();

    // Generate a JWT and save it
    const token = jwt.sign({ userId: newUser._id }, 'secret-key', { expiresIn: '1h' });
    newUser.token = token;
    await newUser.save();

    // Prepare a JSON object to store in Redis
    const userJson = {username, token, timestamp: req.timestamp};

    // Save user data in Redis
    client.hSet(`user:${newUser._id}`, userJson, (err) => {
        if (err) handleErrors(res, 500, 'Internal Server Error');
        else console.log('User data saved in Redis');
    });


    res.json({ message: 'Signup successful', token, user: newUser._id });
};

const login = async (req, res) => {
    const { username, password } = req.body;

    // Check if credentials are given
    if (!username || !password) return handleErrors(res, 401, 'Username and password are required');

    // Check if user exists in MongoDB
    const user = await User.findOne({ username });

    const jsonIfError = {timestamp: new Date().toISOString(), succes: false};
    if (!user) {
        client.hSet(`login`, jsonIfError, (err) => {
            if (err) handleErrors(res, 500, 'Internal Server Error');
            else console.log('Login failure saved (invalid credentials)');
        });
        return handleErrors(res, 401, 'Invalid credentials');
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        client.hSet(`login`, jsonIfError, (err) => {
            if (err) handleErrors(res, 500, 'Internal Server Error');
            else console.log('Login failure saved (password mismatch)');
        });
        return handleErrors(res, 401, 'Invalid credentials');
    }

    // Succes ! Generate and save a token
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    // Prepare a JSON object to store in Redis
    const userJson = {username, token, timestamp:  new Date().toISOString()};

    // Save user data in Redis
    client.hSet(`user:${user._id}`, userJson, (err) => {
        if (err) handleErrors(res, 500, 'Internal Server Error');
    });

    res.json({ message: 'Login successful', token, user: user._id });
};

const logout = async (req, res) => {
    // Remove the user in Redis
    client.del(`user:${req.user.id}`, (err) => {
        if (err) handleErrors(res, 500, 'Internal Server Error');
    });

    // Respond with a successful logout message
    res.json({ message: 'Logout successful' });
};

module.exports = {
    signup,
    login,
    logout,
};