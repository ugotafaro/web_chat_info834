const Message = require('../models/MessageModel.js');
const Conversation = require('../models/ConversationModel.js');
const Chat = require('../models/ChatModel.js');
const User = require('../models/UserModel.js');
const { ObjectId } = require('mongodb');
const { handleErrors } = require('../util.js');


const new_message = async (req, res) => {
    let { content, sender, conversation } = req.body;

    // Vérifiez si les donnés sont correctes
    if (!content) return handleErrors(res, 400, 'Message content is required');
    if (!sender) return handleErrors(res, 400, 'Sender id is required');
    if (!ObjectId.isValid(sender)) return handleErrors(res, 400, 'Invalid sender id');
    if (!conversation) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(conversation)) return handleErrors(res, 400, 'Invalid conversation id');

    sender = new ObjectId(sender);
    conversation = new ObjectId(conversation);

    // Vérifiez si la conversation existe
    const exists = await Conversation.exists(conversation);
    if (!exists) return handleErrors(res, 404, 'Conversation not found');

    // Vérifiez si la création du message est valide
    try {
        let message = new Message({ content, sender, conversation });
        await message.validate();

        message = await Message.create(message);
        return res.json({ message: 'Message created successfully', data: message });
    } catch (error) {
        return handleErrors(res, 400, error.message);
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
    let { conversation } = req.body;

    // Vérifiez si les donnés sont correctes
    if (!conversation) return handleErrors(res, 400, 'Conversation id is required');
    if (!ObjectId.isValid(conversation)) return handleErrors(res, 400, 'Invalid conversation id');

    conversation = new ObjectId(conversation);

    // Vérifiez si la conversation existe
    const exists = await Conversation.exists(conversation);
    if (!exists) return handleErrors(res, 404, 'Conversation not found');

    try {
        // Recherchez les messages associés à la conversation
        const messages = await Message.find({ conversation });

        return res.json({ data: messages });
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
    let { users, name, new_name } = req.body;

    // Vérifiez si le nom de la conversation est spécifié
    if (!name) return handleErrors(res, 400, 'Old conversation name is required');

    // Vérifiez si les utilisateurs sont spécifiés
    users = users.split(',') || [];
    if (!users || users.length === 0) return handleErrors(res, 400, 'Users id are required');

    // Vérifiez si les ID des utilisateurs sont valides
    if (users.some(user => !ObjectId.isValid(user))) return handleErrors(res, 400, 'Invalid users id');
    users = users.map(user => new ObjectId(user));

    // Vérifiez si le nouveau nom de la conversation est spécifié
    if (!new_name) return handleErrors(res, 400, 'New conversation name is required');

    try {
        const messages = await Message.updateMany(
            {
                $or : [
                    { sender: { $in: users } },
                    { receivers: { $elemMatch: { $in: users } } }
                ],
                conversation_name: name
            },
            {
                conversation_name: new_name,
            }
        );

        // Message d'erreur si aucun message n'a été modifié
        if (messages.modifiedCount === 0) return handleErrors(res, 404, 'Conversation not found');

        // Succès ! Le nom de la conversation a été modifié pour tous les messages
        return res.json({ message: 'Conversation name updated for all messages in the conversation', data: messages });
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

