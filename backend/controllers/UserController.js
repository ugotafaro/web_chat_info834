const get = (req, res) => {
    res.json({ user:req.user });
};

module.exports = {
    get,
};