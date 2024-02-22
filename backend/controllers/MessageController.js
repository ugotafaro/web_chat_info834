const Message = require('../models/MessageModel.js');
const { ObjectId } = require('mongodb');
const { handleErrors } = require('../util.js');

const new_message = async (req, res) =>{
    let data = req.body.message;
    const senderId = req.body.sender;
    // Check if task is given
    if (!data) return handleErrors(res, 400, 'Message is required');

    // Check if the id is a valid ObjectId
    if (senderId && !ObjectId.isValid(senderId)) return handleErrors(res, 400, 'Invalid user id');

    try {
        data.user = new ObjectId(userId);
        let task = await Message.create(data);
        return res.json({ message: 'Task created successfully', data: task });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }












    

}
const get_conversation = async (req, res) =>{
    
    

}
const delete_message = async (req, res) =>{
    
    

}
const delete_conversation = async (req, res) =>{
    
    

}
const add_receiver = async (req, res) =>{
    
    

}
const leave_conversation = async (req, res) =>{
    
    

}
const refractor_conversation_name = async (req, res) =>{
    
    

}
module.exports = {
    new_message,
    get_conversation,
    delete_message,
    delete_conversation,
    add_receiver,
    leave_conversation,
    refractor_conversation_name,
  };