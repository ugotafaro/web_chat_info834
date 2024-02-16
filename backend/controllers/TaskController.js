const Task = require('../models/TaskModel.js');
const { ObjectId } = require('mongodb');
const { handleErrors } = require('../util.js');

const get_many = async (req, res) => {
    let { user, category } = req.body;

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(user)) return handleErrors(res, 400, 'Invalid user id');

    try {
        user = new ObjectId(user);
        const tasks = await Task.find({ user, category });
        return res.json({ data: tasks })
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

const get = async (req, res) => {
    const id = req.params.id;

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid ObjectId');

    try {
        const task = await Task.findOne({ _id: new ObjectId(id) });
        if (!task) return handleErrors(res, 404, 'Task not found');
        return res.json({ data: task })
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const all_categories = async (req, res) => {
    const { user } = req.body;
    try {
        const categories = await Task.distinct('category', { user });
        return res.json({ data : categories });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const toggle = async (req, res) => {
    const id = req.params.id;

    // Check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid ObjectId');

    try {
        const task = await Task.findOne({ _id: new ObjectId(id) });
        if (!task) return handleErrors(res, 404, 'Task not found');

        task.done = !task.done;
        const updatedTask = await task.save();
        return res.json({ message: 'Task updated successfully', data: updatedTask });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const add_task = async (req, res) => {
    let data = req.body.task;
    const userId = req.body.user;

    // Check if task is given
    if (!data) return handleErrors(res, 400, 'Task is required');

    // Check if the id is a valid ObjectId
    if (userId && !ObjectId.isValid(userId)) return handleErrors(res, 400, 'Invalid user id');

    // Check if title is set
    if (!data.title) return handleErrors(res, 400, 'Title is required');

    if (data.category === '') delete data.category;

    try {
        data.user = new ObjectId(userId);
        let task = await Task.create(data);
        return res.json({ message: 'Task created successfully', data: task });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

const delete_task = async (req, res) => {
    const { title = "", id } = req.body;

    // Check if credentials are given
    if (!title && !id) return handleErrors(res, 400, 'Id or title is required');


    if(id && !ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid ObjectId');

    try {
        let task;
        if(id) {
            task = await Task.deleteOne({ _id: new ObjectId(id) });
        } else if (title) {
            task = await Task.deleteMany({ title: title });
        }

        return res.json({ message: 'Task deleted successfully', data: task });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}


const delete_category = async (req, res) => {
    const { category } = req.body;

    // Check if credentials are given
    if (!category) return handleErrors(res, 400, 'Category name is required');

    try {
        let task = await Task.deleteMany({ category: category });

        return res.json({ message: 'Category deleted successfully', data: task });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

module.exports = {
  get_many,
  get,
  all_categories,
  toggle,
  add_task,
  delete_task,
  delete_category,
};