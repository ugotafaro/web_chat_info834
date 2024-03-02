const mongoose = require('mongoose');
const Message = require('./models/MessageModel');

mongoose.connect('mongodb://scadereau:haa00@193.48.125.44:27017/hugougolois?authMechanism=DEFAULT&authSource=admin');
const db = mongoose.connection;

db.on('error', () => { console.error('[INFO] Echec de connexion à MongoDB') });
db.once('open', () => { console.log('[INFO] Connexion à MongoDB réussie') });

// TODO : Remove
async function createAndSaveMessage() {
    await Message.deleteMany({});
    let message = await Message.create({content: 'Hi !', sender: '65cf88d47454c0b8fec5de40', conversation_name: 'test', receivers: ['65ddc1ac007f09cc725ad3a6', '65de3ae5aa5600d1776d9c4b']});
}

createAndSaveMessage();
module.exports = db;