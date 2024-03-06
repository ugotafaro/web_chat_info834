const User = require('../models/UserModel');
const { handleErrors } = require('../util');

const get = (req, res) => {

    // Check if user is the same as the one in the token
    if (req.user.id !== req.params.id) return handleErrors(res, 403, 'Forbidden');

    res.json({ user:req.user });
};

const search_user = async (req, res) => {
    let { search } = req.body;
    
    if (!search) return handleErrors(res, 400, 'Search parameter is required');
    if (search.length < 3) return handleErrors(res, 400, '3 character minimum is required');
    try {
        const regex = new RegExp(search, 'i');
        const users = await User.find({
            $or: [
                { username:{ $regex: regex } },
                { firstname:{ $regex: regex } },
                { lastname: { $regex: regex } }
            ]
        },"-password");

        if (!users || users.length === 0) return res.json({ message: 'No user found' });
        else {
           
            return res.json({ message: 'User found', data: users });
        }
    }
    catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

module.exports = {
    get,
    search_user,
};