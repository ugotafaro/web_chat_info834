const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

    res.json({ message: 'Signup successful', token, user: newUser._id });
};

const login = async (req, res) => {
    const { username, password } = req.body;
    // Check if credentials are given
    if (!username || !password) return handleErrors(res, 401, 'Username and password are required');

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return handleErrors(res, 401, 'Invalid credentials');

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return handleErrors(res, 401, 'Invalid credentials');

    // Succes ! Generate and save a token
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.json({ message: 'Login successful', token, user: user._id });
};

const logout = async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user;

        // Update the user's MongoDB entry to remove the token
        const updatedUser = await User.findByIdAndUpdate(userId, { $unset: { token : 1 } }, { new: true });
        if (!updatedUser) return handleErrors(res, 404, 'User not found');

        // Respond with a successful logout message
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        return handleErrors(res, 500, 'Internal Server Error');
    }
};

module.exports = {
    signup,
    login,
    logout,
};