const mongoose = require('mongoose');
const Conversation = require('./models/ConversationModel');
const Message = require('./models/MessageModel');
const User = require('./models/UserModel');
const { exec } = require('child_process');
const bcrypt = require('bcrypt');

mongo_choice = 'remote';
if (mongo_choice === 'local') {
    // Lancement des replicats sets MongoDB
    exec('start-mongodb.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Script error: ${stderr}`);
            return;
        }
        console.log(`Script output: ${stdout}`);
    });

    // Connexion locale à MongoDB
    mongoose.connect('mongodb://localhost:27018,localhost:27019,localhost:27020/hugougolois?replicaSet=rs0').catch(err => console.error('[INFO] Echec de connexion à MongoDB'));
} else if (mongo_choice === 'remote') {
    // Connexion remote à MongoDB
    mongoose.connect('mongodb://scadereau:haa00@193.48.125.44:27017/hugougolois?authMechanism=DEFAULT&authSource=admin').catch(err => { console.error('[INFO] Echec de connexion à MongoDB (Vérifiez VPN)') });
}

const db = mongoose.connection;

async function createView() {
    const pipeline = [
        { $lookup: { from: "messages", localField: "_id", foreignField: "conversation", as: "messages" } },
        { $lookup: { from: "users", localField: "users", foreignField: "_id", as: "users" } },
        { $project: { _id: 1, name: 1, users: { $map: { input: "$users", as: "usr", in: { _id: "$$usr._id", username: "$$usr.username", lastname: "$$usr.lastname", firstname: "$$usr.firstname" } } }, messages: { $map: { input: "$messages", as: "msg", in: { content: "$$msg.content", sender: "$$msg.sender", createdAt: "$$msg.createdAt", updatedAt: "$$msg.updatedAt" } } } } }
    ];

    await db.createCollection("chats", { viewOn: "conversations", pipeline: pipeline });
}

if (mongo_choice === 'local') {
    createView();
}

// Create function to populate the database
async function populate() {
    await User.deleteMany({});
    let ugo = await User.create({ username: 'ugo', password: await bcrypt.hash('feur2024', 10), firstname: 'Ugo', lastname: 'Tafaro' });
    let ugautre = await User.create({ username: 'ugautre', password: await bcrypt.hash('feur2024', 10), firstname: 'Pugo', lastname: 'Lataf' });
    let lois = await User.create({ username: 'lois', password: await bcrypt.hash('1234', 10), firstname: 'Lois', lastname: 'Blin' });
    let lautre = await User.create({ username: 'lautre', password: await bcrypt.hash('1234', 10), firstname: 'Lotre', lastname: 'Plein' });
    let hugo = await User.create({ username: 'hugo', password: await bcrypt.hash('foobar22', 10), firstname: 'Hugo', lastname: 'Beaubrun' });
    let mocheblond = await User.create({ username: 'mocheblond', password: await bcrypt.hash('foobar22', 10), firstname: 'Gohu', lastname: 'Mocheblond' });
    let andres = await User.create({ username: 'andres', password: await bcrypt.hash('jaimeleschatsjaimelabouffejaimelecafe', 10), firstname: 'Andres', lastname: 'Cortes' });

    await Conversation.deleteMany({});
    let conv1 = await Conversation.create({name: 'Les croisés ✝', users: [ugo._id, lois._id, hugo._id]})
    let conv2 = await Conversation.create({name: 'Zugos ⛪', users: [ugo._id, ugautre._id, hugo._id, mocheblond._id]})
    let conv3 = await Conversation.create({name: '100m ricard', users: [lois._id, lautre._id]})
    let conv4 = await Conversation.create({name: 'J\'arrive pas les replicats set ouin ouin 🤓', users: [ugo._id, ugautre._id, lois._id, lautre._id, hugo._id, mocheblond._id]})
    let conv5 = await Conversation.create({name: '🤠 El groupo 🤠', users: [ugo._id, ugautre._id, lois._id, lautre._id, hugo._id, andres._id]})

    await Message.deleteMany({});
    // Les croisés
    await Message.create({content: 'Bonjour, jeune et courageux(euse) croisé(e). Que fait-tu ici ?', sender: ugo._id, conversation: conv1._id});
    await Message.create({content: 'Je suis à la recherche de l\'épée sacré ⚔️ de la meilleure fakeliste annécienne', sender: lois._id, conversation: conv1._id});
    await Message.create({content: 'De quelle épée parles-tu ? Je n\'ai jamais entendu parler de cette légende', sender: ugo._id, conversation: conv1._id});
    await Message.create({content: 'C’est la légende de saint-reffet ', sender: lois._id, conversation: conv1._id});
    await Message.create({content: 'Vive les croisées', sender: ugo._id, conversation: conv1._id});
    await Message.create({content: 'Quoi ?', sender: hugo._id, conversation: conv1._id});
    await Message.create({content: 'feur', sender: lois._id, conversation: conv1._id});

    // Zugos

    // 100m ricard

    // Replicats set

    // El groupo
    await Message.create({content: '@lois ?', sender: ugo._id, conversation: conv5._id});
    await Message.create({content: 'Café ☕☕☕?', sender: ugo._id, conversation: conv5._id});
    await Message.create({content: 'Demande au mexicain', sender: lois._id, conversation: conv5._id});
    await Message.create({content: '???', sender: andres._id, conversation: conv5._id});
    await Message.create({content: 'Tapas', sender: ugo._id, conversation: conv5._id});
    await Message.create({content: 'Tapaas', sender: ugo._id, conversation: conv5._id});
    await Message.create({content: 'Tapas', sender: ugo._id, conversation: conv5._id});
    await Message.create({content: 'fajitas', sender: lois._id, conversation: conv5._id});
    await Message.create({content: 'burrito', sender: hugo._id, conversation: conv5._id});
    await Message.create({content: 'Andres donne des plats', sender: hugo._id, conversation: conv5._id});
    await Message.create({content: 'japalenos', sender: hugo._id, conversation: conv5._id});
    await Message.create({content: 'c\'est pas un plat duc**', sender: lois._id, conversation: conv5._id});
    await Message.create({content: 'héroïne', sender: ugo._id, conversation: conv5._id});
    await Message.create({content: '😂😂😂', sender: lois._id, conversation: conv5._id});
    await Message.create({content: '😂', sender: hugo._id, conversation: conv5._id});
    await Message.create({content: 'Ntm', sender: andres._id, conversation: conv5._id});
    await Message.create({content: 'Moi j\'aime juste le café', sender: andres._id, conversation: conv5._id});
    await Message.create({content: 'Et la carné', sender: andres._id, conversation: conv5._id});
    await Message.create({content: 'St-carné✝', sender: lois._id, conversation: conv5._id});
}
//populate();

db.once('open', () => { console.log(`[INFO] MongoDB up (${mongo_choice})`) });
module.exports = db;