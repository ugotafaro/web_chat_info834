const { handleErrors } = require('../util');

const get = (req, res) => {

    // Check if user is the same as the one in the token
    if (req.user.id !== req.params.id) return handleErrors(res, 403, 'Forbidden');

    res.json({ user:req.user });
};

module.exports = {
    get,
};