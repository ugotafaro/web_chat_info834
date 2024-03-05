const Message = require('../models/MessageModel.js');
const Conversation = require('../models/ConversationModel.js');
const Chat = require('../models/ChatModel.js');
const User = require('../models/UserModel.js');
const { ObjectId } = require('mongodb');
const { handleErrors } = require('../util.js');


const new_message = async (content, sender, conversation) => {
    // Vérifiez si les donnés sont correctes
    if (!content) throw new Error('Message content is required');
    if (!sender) throw new Error('Sender id is required');
    if (!ObjectId.isValid(sender)) throw new Error('Invalid sender id');
    if (!conversation) throw new Error('Conversation id is required');
    if (!ObjectId.isValid(conversation)) throw new Error('Invalid conversation id');

    sender = new ObjectId(sender);
    conversation = new ObjectId(conversation);

    // Vérifiez si la conversation existe
    const exists = await Conversation.exists(conversation);
    if (!exists) throw new Error('Conversation not found');

    // Vérifiez si la création du message est valide
    try {

        let message = new Message({ content, sender, conversation });
        await message.validate();

        message = await Message.create(message);
        return res.json({ message: 'Message created successfully', data: message });
    } catch (error) {
        throw new Error(error.message);
    }

};

const get_conversations = async (req, res) => {
    let { user } = req.body;

    // Vérifiez si l'utilisateur sont spécifiés
    if (!user) return handleErrors(res, 400, 'User id is required');
    if (!ObjectId.isValid(user)) return handleErrors(res, 400, 'Invalid user id');

    user = new ObjectId(user);

    try {
        // Recherchez les chats (conversations + messages + utilisateurs) associés à l'utilisateur
        const data = await Chat.find({ users: { $elemMatch: { _id: user } }});

        return res.json({ data });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const get_conversation = async (req, res) => {
    let { id } = req.body;

    // Vérifiez si les donnés sont correctes
    if (!id) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid conversation id');
    id = new ObjectId(id);

    // Vérifiez si la conversation existe
    const exists = await Conversation.exists(id);
    if (!exists) return handleErrors(res, 404, 'Conversation not found');

    try {
        // Recherchez les messages associés à la conversation
        const conversation = await Chat.find({ _id: id });

        return res.json({ data: conversation });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const delete_message = async (req, res) => {
    let { id } = req.body;

    // Vérifiez si l'ID est donné
    if (!id) return handleErrors(res, 400, 'Message id is required');
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid message id');
    id = new ObjectId(id);

    // Vérifiez si le message existe
    const exists = await Message.exists(id);
    if (!exists) return handleErrors(res, 404, 'Message not found');

    try {
        const message = await Message.deleteMany({ _id: id });
        return res.json({ message: 'Message deleted successfully', data: message });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const delete_conversation = async (req, res) =>{
    let { id } = req.body;

    // Vérifiez si l'id de la conversation est spécifié
    if (!id) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid conversation id');
    id = new ObjectId(id);

    try {
        // Supprimez la conversation
        const conversation = await Conversation.deleteOne({ _id: id });

        // Supprimez les messages associés à la conversation
        const messages = await Message.deleteMany({ conversation: id });

        let no_change = conversation.deletedCount === 0 && messages.deletedCount === 0;
        if (no_change) {
            return handleErrors(res, 404, 'Conversation not found');
        }

        return res.json({ message: 'Conversation deleted successfully', data: { messages, conversation } });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

const join_conversation = async (req, res) => {
    let { new_user, id } = req.body;

    // Vérifiez l'ID du nouvel utilisateur
    if (!new_user) return handleErrors(res, 400, 'User id is required');
    if (!ObjectId.isValid(new_user)) return handleErrors(res, 400, 'Invalid user id');
    new_user = new ObjectId(new_user);

    // Vérifiez l'ID de la conversation
    if (!id) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid conversation id');
    id = new ObjectId(id);

    // Vérifiez si la conversation et l'utilisateur existe
    let exists = await Conversation.exists(id);
    if (!exists) return handleErrors(res, 404, 'Conversation not found');
    exists = await User.exists(new_user);
    if (!exists) return handleErrors(res, 404, 'User not found');

    try {
        // Mettre à jour la conversation pour ajouter le nouvel utilisateur
        const conversation = await Conversation.updateOne({ _id: id }, { $push: { users: new_user } });

        return res.json({ message: 'User added to conversation', data: conversation });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

const leave_conversation = async (req, res) =>{
    let { leaver, id } = req.body;

    // Vérifiez l'ID de l'utilisateur qui quitte
    if (!leaver) return handleErrors(res, 400, 'User (leaver) id is required');
    if (!ObjectId.isValid(leaver)) return handleErrors(res, 400, 'Invalid user (leaver) id');
    leaver = new ObjectId(leaver);

    // Vérifiez l'ID de la conversation
    if (!id) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid conversation id');
    id = new ObjectId(id);

    // Vérifiez si la conversation et l'utilisateur existe
    let exists = await Conversation.exists(id);
    if (!exists) return handleErrors(res, 404, 'Conversation not found');
    exists = await User.exists(leaver);
    if (!exists) return handleErrors(res, 404, 'User not found');

    // Vérifiez si l'utilisateur est dans la conversation
    const conversation = await Conversation.findOne({ _id: id, users: { $elemMatch: { $eq: leaver } } });
    if (!conversation) return handleErrors(res, 404, 'User not in the conversation');

    try {
        // Mettre à jour la conversation pour retirer le nouvel utilisateur
        const conversation = await Conversation.updateOne({ _id: id }, { $pull: { users: leaver } });

        return res.json({ message: 'User removed from the conversation', data: conversation });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

const rename_conversation = async (req, res) =>{
    let { id, new_name } = req.body;

    // Vérifiez l'ID de la conversation
    if (!id) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(id)) return handleErrors(res, 400, 'Invalid conversation id');
    id = new ObjectId(id);

    // Vérifiez si le nouveau nom de la conversation est spécifié
    if (!new_name) return handleErrors(res, 400, 'New conversation name is required');

    try {
        // Mettre à jour la conversation pour changer le nom
        const conversation = await Conversation.updateOne({ _id: id }, { name: new_name });

        return res.json({ message: 'Conversation name updated', data: conversation });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

module.exports = {
    new_message,
    get_conversation,
    get_conversations,
    delete_message,
    delete_conversation,
    join_conversation,
    leave_conversation,
    rename_conversation,
  };

