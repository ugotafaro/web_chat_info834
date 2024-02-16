const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const { handleErrors } = require('../util');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization');

  // Check if token is given
  if (!token) return handleErrors(res, 401, 'Unauthorized');

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'secret-key');

    // Check if user exists
    const user = await User.findById(decoded.userId);

    if (!user) return handleErrors(res, 401, 'Invalid token');

    req.user = user;
    next();
  } catch (error) {
    return handleErrors(res, 401, 'Invalid token');
  }
};

module.exports = authenticate;