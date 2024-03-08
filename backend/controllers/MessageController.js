const Message = require('../models/MessageModel.js');
const Conversation = require('../models/ConversationModel.js');
const Chat = require('../models/ChatModel.js');
const User = require('../models/UserModel.js');
const { ObjectId } = require('mongodb');
const { handleErrors } = require('../util.js');


const new_message = async (data) => {
    let { content, sender, conversation } = data;

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
        return await Message.create(message);
    } catch (error) {
        throw new Error(error.message);
    }

};

const get_conversations = async (data) => {
    let user = data.user;

    // Vérifiez si l'utilisateur sont spécifiés
    if (!user) throw new Error('User id is required');
    if (!ObjectId.isValid(user)) throw new Error('Invalid user id');
    user = new ObjectId(user);

    try {
        // Recherchez les chats (conversations + messages + utilisateurs) associés à l'utilisateur
        return await Chat.find({ users: { $elemMatch: { _id: user } }});
    } catch (e) {
        throw new Error(e.message);
    }
};

const get_conversation = async (req, res) => {
    let id = req.query.id;

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

const new_conversation = async (data) => {
    let { users, name } = data;

    // Vérifiez si les donnés sont correctes
    if (!name) throw new Error('Conversation name is required');
    if (name.length < 3) throw new Error('Conversation name should be at least 3 characters long');
    if (!users) throw new Error('At least two users ID are required');
    users = users.split(',') || [];
    if (users.length < 2) throw new Error('At least two users ID are required');
    if (users.some(user => !ObjectId.isValid(user))) throw new Error('Invalid user ID');
    users = users.map(user => new ObjectId(user));

    // Créer la conversation
    try {
        return await Conversation.create({ name, users });
    } catch (error) {
        throw new Error(error.message);
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

const join_conversation = async (data) => {
    let { user, conversation } = data;

    // Vérifiez l'ID du nouvel utilisateur
    if (!user) throw new Error('User id is required');
    if (!ObjectId.isValid(user)) throw new Error('Invalid user id');
    user = new ObjectId(user);

    // Vérifiez l'ID de la conversation
    if (!conversation) throw new Error('Conversation id is required');
    if (!ObjectId.isValid(conversation)) throw new Error('Invalid conversation id');
    conversation = new ObjectId(conversation);

    // Vérifiez si la conversation et l'utilisateur existe
    let exists = await Conversation.exists(conversation);
    if (!exists) throw new Error('Conversation not found');
    exists = await User.exists(user);
    if (!exists) throw new Error('User not found');

    try {
        // Mettre à jour la conversation pour ajouter le nouvel utilisateur
        return await Conversation.updateOne({ _id: conversation }, { $push: { users: user } });
    } catch (e) {
        throw new Error(e.message);
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
    new_conversation,
    delete_message,
    delete_conversation,
    join_conversation,
    leave_conversation,
    rename_conversation,
  };

