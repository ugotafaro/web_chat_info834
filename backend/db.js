const mongoose = require('mongoose');
const Conversation = require('./models/ConversationModel');
const User = require('./models/UserModel');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://scadereau:haa00@193.48.125.44:27017/hugougolois?authMechanism=DEFAULT&authSource=admin');
const db = mongoose.connection;

// Create function to populate the database
async function populate() {
    await User.deleteMany({});
    let user1 = await User.create({ username: 'ugo', password: await bcrypt.hash('feur2024', 10), firstname: 'Ugo', lastname: 'Tafaro' });
    let user2 = await User.create({ username: 'ugautre', password: await bcrypt.hash('feur2024', 10), firstname: 'Pugo', lastname: 'Lataf' });
    let user3 = await User.create({ username: 'lois', password: await bcrypt.hash('1234', 10), firstname: 'Lois', lastname: 'Blin' });
    let user4 = await User.create({ username: 'lautre', password: await bcrypt.hash('1234', 10), firstname: 'Lotre', lastname: 'Plein' });
    let user5 = await User.create({ username: 'hugo', password: await bcrypt.hash('foobar22', 10), firstname: 'Hugo', lastname: 'Beaubrun' });
    let user6 = await User.create({ username: 'mocheblond', password: await bcrypt.hash('foobar22', 10), firstname: 'Gohu', lastname: 'Mocheblong' });

    await Conversation.deleteMany({});
    let conv1 = await Conversation.create({name: 'Les croisés ✝', users: [user1._id, user3._id, user5._id]})
    let conv2 = await Conversation.create({name: 'Zugos ⛪', users: [user1._id, user2._id, user5._id, user6._id]})
    let conv3 = await Conversation.create({name: '100m ricard', users: [user3._id, user4._id]})

    // await Message.deleteMany({});
    // let message = await Message.create({content: 'Hi !', sender: '65cf88d47454c0b8fec5de40', conversation: conv1._id});
    // let message2 = await Message.create({content: 'Hi test guy !', sender: '65de3ae5aa5600d1776d9c4b', conversation: conv1._id});
    // let message3 = await Message.create({content: 'Is anyone there ?', sender: '65ddc1ac007f09cc725ad3a6', conversation: conv2._id});
}
// populate();

db.on('error', () => { console.error('[INFO] Echec de connexion à MongoDB') });
db.once('open', () => { console.log('[INFO] Connexion à MongoDB réussie') });

module.exports = db;