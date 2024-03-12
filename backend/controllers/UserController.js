const User = require('../models/UserModel');
const { handleErrors } = require('../util');

const get = (req, res) => {

    // Check if user is the same as the one in the token
    if (req.user.id !== req.params.id) return handleErrors(res, 403, 'Forbidden');

    res.json({ user:req.user });
};

const search_users = async (data) => {
    let { search } = data;

    if (!search) throw new Error('Search parameter is required');
    if (search.length < 3) throw new Error('3 character minimum is required');
    try {
        const regex = new RegExp(search, 'i');
        return await User.find({
            $or: [
                { username:{ $regex: regex } },
                { firstname:{ $regex: regex } },
                { lastname: { $regex: regex } }
            ]
        },"-password");
    }
    catch (e) {
        throw new Error(e.message);
    }
};

module.exports = {
    get,
    search_users,
};