const jwt = require('jsonwebtoken');
const { client } = require('../redis.js');
const { handleErrors } = require('../util');

const authenticated = async (req, res, next) => {
    const token = req.header('Authorization');

    const timestamp = new Date().toISOString();

    // Check if token is given
    if (!token) return handleErrors(res, 401, 'Unauthorized');

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, 'secret-key');
    } catch (error) {
        return handleErrors(res, 401, 'Invalid token');
    }

    // Verify if user exists in Redis
    const foo = await client.exists(`user:${decoded.userId}`, (err, res) => {
        if (err) return handleErrors(res);
    });
    if (foo === 0) return handleErrors(res, 404, 'User not found');

    // Get user data from Redis
    req.user = await client.hGetAll(`user:${decoded.userId}`, (err, res) => {
        if (err) return handleErrors(res);
    });

    req.user.id = decoded.userId;
    req.timestamp = timestamp;
    next();
};

module.exports = authenticated;
