const WS = require('ws');
const messageController = require('./controllers/MessageController');
const { client } = require('./redis.js');
const Conversation = require('./models/ConversationModel.js');

class ChatWS extends  WS.WebSocketServer {
    constructor(options) {
        super(options);
        this.on('connection', this.onConnection.bind(this));
        this.on('listening', this.onListening.bind(this));
        this.on('error', this.onError.bind(this));
    }

    onListening() {
        console.log(`[INFO] WebSocketServer up on ws://localhost:${this.options.port}`);
    }

    onConnection(ws) {
        console.log(`[WS] Connexion ouverte (${this.clients.size} clients)`);

        // Binding
        ws.on('message', this.onMessage.bind(this, ws));
        ws.on('close', this.onClose.bind(this, ws));
    }

    onClose() {
        console.log(`[WS] Connexion fermée (${this.clients.size} clients)`);
    }

    onError(error) {
        console.error('[WS] Erreur ', error);
    }

    async onMessage(ws, message) {
        const { action, data } = JSON.parse(message);

        // Authentification : cas unique où l'utilisateur n'a pas besoin d'être loggé
        if (action === 'set-user') {
            let { user } = data;
            this.onSetUser(ws, user);
            return;
        }

        // Vérifier si l'utilisateur est loggé au websocket
        if(!ws.user) {
            return ws.send(JSON.stringify({ error: 'You must be logged in to perform actions, please send the user id via the \'set-user\' action'}));
        }

        // Vérifier les données
        if (!action) return ws.send(JSON.stringify({ error: 'Action is required' }));
        if (!data) return ws.send(JSON.stringify({ error: 'Data is required' }));

        // Act !
        switch (action) {
            case 'new-message':
                let { content, conversation } = data;
                this.onNewMessage(ws, content, conversation);
                break;
            default:
                return;
        }
    }

    async onSetUser(ws, user) {
        // Vérifier les données
        if (!user) {
            return ws.send(JSON.stringify({ error: 'User is required' }));
        }

        // Vérifier si l'utilisateur est connecté sur Redis
        let exists = await client.exists(`user:${user}`);
        if (exists === 0) {
            return ws.send(JSON.stringify({ error: 'User isn\'t logged in' }));
        }

        // Vérifier si l'utilisateur n'a pas déjà une connexion websocket
        for (let client of this.clients) {
            if (client.user !== user) continue;
            return ws.send(JSON.stringify({ error: 'User already has a websocket connection' }));
        }

        // Succès !
        ws.user = user;
        console.log(`[WS] User ${ws.user.substring(0, 4)}... connecté`);

        // Récupérer et envoyer les conversations de l'utilisateur
        try {
            let conversations = await messageController.get_conversations(user);
            return ws.send(JSON.stringify({ action: 'get-conversations', data: { conversations } }));
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    async onNewMessage(ws, content, conversation) {
        // Créer le message et broadcaster
        try {
            // Créer le message avec le controller
            const createdMessage = await messageController.new_message(content, ws.user, conversation);

            // Récupérer l'ID des autres utilisateurs dans la conversation
            let others = await Conversation.findById(conversation, 'users');
            others = others.users.map((user) => user.toString()).filter((user) => user !== ws.user);

            // Broadcast le message aux autres utilisateurs
            this.clients.forEach((client) => {
                let shouldSend = client.readyState === ws.OPEN && others.includes(client.user);
                if (shouldSend) {
                    client.send(JSON.stringify({ action: 'new-message', data: createdMessage }));
                }
            });

            // Check si le message contient des mots spéciaux
            if (content === 'ping') {
                return ws.send(JSON.stringify({ action: 'new-special-message', content: 'pong' }));
            }

            // Check si le message finit par 'quoi'
            let quoiWords = ['quoi', 'quoi?', 'quoi ?', 'quoi !', 'quoi !?', 'quoi ! ?']
            if (quoiWords.some((word) => content.endsWith(word))) {
                return ws.send(JSON.stringify({ content: 'feur' }));
            }

            // Check si le message finit par un mot divin 🙏 Amen
            let divineWords = ['st', 'saint', 'sein', 'sin', 'sain', 'saints']
            let divineSaints = ['tropez','glé','tre','crusté','doux','jecter','carné','cope','port-export','refait','toxiqué','con-pétant','gurgite','primante','razin', 'plomb-95', 'pagnan', 'pathoche', 'ture', 'secte', 'clinaison', 'fusion']
            if (divineWords.some((word) => content.endsWith(word))) {
                // Récupérer un saint aléatoire
                let saint = divineSaints[Math.floor(Math.random() * divineSaints.length)];
                return ws.send(JSON.stringify({ action: 'new-special-message', content: `✝🙏 Saint-${saint} 🙏✝` }));
            }
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }
}

module.exports = ChatWS;
