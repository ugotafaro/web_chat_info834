const Message = require('../models/MessageModel.js');
const { ObjectId } = require('mongodb');
const { handleErrors } = require('../util.js');


const new_message = async (req, res) => {
    let { content, sender, conversation_name, receivers } = req.body;

    // Vérifiez si les donnés sont correctes
    if (!content) return handleErrors(res, 400, 'Message content is required');
    if (!sender) return handleErrors(res, 400, 'Sender id is required');
    if (sender && !ObjectId.isValid(sender)) return handleErrors(res, 400, 'Invalid sender id');
    if (!conversation_name) return handleErrors(res, 400, 'Conversation name is required');

    // Vérifiez si les ID des destinataires sont valides
    receivers = receivers.split(',') || [];
    if (receivers.some(receiver => !ObjectId.isValid(receiver))) {
        return handleErrors(res, 400, `Invalid receiver id`);
    }
    receivers = receivers.map(receiver => new ObjectId(receiver));

    // Vérifiez si la création du message est valide
    try {
        let message = new Message({ content, sender, conversation_name, receivers });
        await message.validate();

        message = await Message.create(message);
        return res.json({ message: 'Message created successfully', data: message });
    } catch (error) {
        return handleErrors(res, 400, error.message);
    }
};


const get_conversations = async (req, res) => {
    let { receivers } = req.body;

    // Vérifiez si les destinataires sont spécifiés
    receivers = receivers.split(',') || [];
    if (!receivers || receivers.length === 0) {
        return handleErrors(res, 400, 'Receivers are required');
    }

    // Vérifiez si les ID des destinataires sont valides
    if (receivers.some(receiver => !ObjectId.isValid(receiver))) {
        return handleErrors(res, 400, 'Invalid receiver id');
    }

    try {
        receivers = receivers.map(receiver => new ObjectId(receiver));

        // Recherchez les messages associés aux destinataires spécifiés
        const messages = await Message.find({ receivers: { $all: receivers } });

        return res.json({ data: messages });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
};

const get_conversation = async (req, res) => {
    let { user } = req.body;

    // Vérifiez si l'utilisateur est correct
    if (!user) return handleErrors(res, 400, 'User id is required');
    if (!ObjectId.isValid(user)) return handleErrors(res, 400, 'Invalid user id');
    user = new ObjectId(user);

    try {
        // Recherchez les messages où l'utilisateur est l'expéditeur, ou s'il est contenu dans la liste des destinataires
        const messages = await Message.find({ $or: [{ sender: user }, { receivers: { $in: [user] } }] });

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
    let { users, name } = req.body;

    // Vérifiez si le nom de la conversation est spécifié
    if (!name) {
        return handleErrors(res, 400, 'Conversation name is required');
    }

    // Vérifiez si les destinataires sont spécifiés
    users = users.split(',') || [];
    if (!users || users.length === 0) {
        return handleErrors(res, 400, 'Receivers are required');
    }

    // Vérifiez si les ID des utilisateurs sont valides
    if (users.some(user => !ObjectId.isValid(user))) {
        return handleErrors(res, 400, 'Invalid receiver id');
    }
    users = users.map(user => new ObjectId(user));

    try {
        // Supprimez les messages associés aux utilisateurs spécifiés
        const messages = await Message.deleteMany(
            { $or : [
                { sender: { $in: users } },
                { receivers: { $elemMatch: { $in: users } } }
            ], conversation_name: name
        });

        if (messages.deletedCount === 0) {
            return handleErrors(res, 404, 'Conversation not found');
        }

        return res.json({ message: 'Conversation deleted successfully', data: messages });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }



}
const join_conversation = async (req, res) => {
    let { new_user, users, name } = req.body;

    // Vérifiez l'ID du nouvel utilisateur
    if (!new_user) return handleErrors(res, 400, 'User id is required');
    if (!ObjectId.isValid(new_user)) return handleErrors(res, 400, 'Invalid user id');
    new_user = new ObjectId(new_user)

    // Vérifiez si le nom de la conversation est spécifié
    if (!name) return handleErrors(res, 400, 'Conversation name is required');

    // Vérifiez si les destinataires sont spécifiés
    users = users.split(',') || [];
    if (!users || users.length === 0) return handleErrors(res, 400, 'Users id are required');

    // Vérifiez si les ID des utilisateurs sont valides
    if (users.some(user => !ObjectId.isValid(user))) return handleErrors(res, 400, 'Invalid users id');
    users = users.map(user => new ObjectId(user));

    try {
        // Mettre à jour tous les messages ayant les mêmes utilisateurs et le même nom
        const messages = await Message.updateMany(
            {
                $or : [
                    { sender: { $in: users } },
                    { receivers: { $elemMatch: { $in: users } } }
                ],
                conversation_name: name
            },
            {
                $push: { receivers: new_user }
            }
        );

        return res.json({ message: 'Receivers added to all messages in the conversation', data: messages });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }
}

const leave_conversation = async (req, res) =>{
    const { removeId, receiver } = req.body;

    // Vérifiez si l'ID et le destinataire sont donnés
    if (!removeId || !receiver) {
        return handleErrors(res, 400, 'ID and receiver are required');
    }

    // Vérifiez si l'ID est un ObjectId valide
    if (!ObjectId.isValid(removeId)) {
        return handleErrors(res, 400, 'Invalid ObjectId');
    }

    try {
        // Récupérez tous les messages ayant les mêmes destinataires
        receivers = receivers.map(receiver => new ObjectId(receiver));
        const messages = await Message.find({ receivers: { $all: receivers } });

        // Mettez à jour chaque message pour enlever le destinataire
        const promises = messages.map(async (message) => {
            const updatedMessage = await Message.findByIdAndUpdate(message._id, { $pull: { receivers: new ObjectId(removeId) } }, { new: true });
            return updatedMessage;
        });

        // Exécutez toutes les mises à jour en parallèle
        const updatedMessages = await Promise.all(promises);

        return res.json({ message: 'Receiver removed from all messages in the conversation', data: updatedMessages });
    } catch (e) {
        return handleErrors(res, e.code, e.message);
    }



}
const refractor_conversation_name = async (req, res) =>{
    const { receivers, newName } = req.body;

    // Vérifiez si la liste des receveurs et le nouveau nom sont donnés
    if (!receivers || !newName) {
        return handleErrors(res, 400, 'Receivers list and new name are required');
    }

    try {
        // Récupérez tous les messages ayant les mêmes destinataires
        receivers = receivers.map(receiver => new ObjectId(receiver));
        const messages = await Message.find({ receivers: { $all: receivers } });

        // Mettez à jour chaque message pour modifier le nom de la conversation
        const promises = messages.map(async (message) => {
            const updatedMessage = await Message.findByIdAndUpdate(
                message._id,
                { conversation_name: newName },
                { new: true }
            );
            return updatedMessage;
        });

        // Exécutez toutes les mises à jour en parallèle
        const updatedMessages = await Promise.all(promises);

        return res.json({ message: 'Conversation name updated for all messages in the conversation', data: updatedMessages });
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
    refractor_conversation_name,
  };

