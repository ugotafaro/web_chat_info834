const mongoose = require('mongoose');

mongoose.connect('mongodb://scadereau:haa00@193.48.125.44:27017/hugougolois?authMechanism=DEFAULT&authSource=admin');
//mongoose.connect('mongodb://localhost:27017/hugougolois');
const db = mongoose.connection;

db.on('error', () => { console.error('[INFO] Echec de connexion à MongoDB') });
db.once('open', () => { console.log('[INFO] Connexion à MongoDB réussie') });

module.exports = db;