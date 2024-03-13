const WS = require('ws');
const messageController = require('./controllers/MessageController');
const userController = require('./controllers/UserController');
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

    async onMessage(ws, message) {
        let data = JSON.parse(message);
        // console.log(`[WS] Receiving \"${data['content']}\"`);

        // Check if message is a ping
        if (data['content'] === 'ping') {
            ws.send(JSON.stringify({ content: 'pong' }));
            return;
        }

        let quoiWords = ['quoi', 'quoi?', 'quoi ?', 'quoi !', 'quoi !?', 'quoi ! ?']

        // Check if message ends in 'quoi'
        if (quoiWords.some((word) => data['content'].endsWith(word))) {
            ws.send(JSON.stringify({ content: 'feur' }));
            return;
        }

        let divineWords = ['st', 'saint', 'sein', 'sin', 'sain', 'saints']
        let divineSaints = ['tropez','glé','tre','crusté','doux','jecter','carné','cope','port-export','refait','toxiqué','con-pétant','gurgite','primante','razin', 'plomb-95', 'pagnan', 'pathoche', 'ture', 'secte', 'clinaison', 'fusion']

        // Check if message ends with 'saint'
        if (divineWords.some((word) => data['content'].endsWith(word))) {
            // Get random divine saint
            let saint = divineSaints[Math.floor(Math.random() * divineSaints.length)];
            ws.send(JSON.stringify({ content: `✝🙏 Saint-${saint} 🙏✝` }));
            return;
        }

        // Main logic for message handling
        try {
            let data = JSON.parse(message);
            const { content, conversation, user: sender } = data;

            console.log('Message:', data);

            // Create message using controller
            const createdMessage = await messageController.new_message(content, sender, conversation);
            console.log('Message created:', createdMessage);
        } catch (error) {
            console.error('Error creating message:', error.message);
        }

        // TODO : Broadcast
        // Display clients size
        console.log(`[WS] ${this.clients.size} clients`);
        // this.clients.forEach((client) => {
        //     if (client !== ws && client.readyState === ws.OPEN) {
        //         client.send(message);
        //     }
        // });
    }

    onClose() {
        console.log('[WS] Connexion fermée');
        console.log(`[WS] ${this.clients.size} clients`);
    }

    onError(error) {
        console.error('[WS] Erreur ', error);
    }

    async onMessage(ws, message) {
        // Try to parse the message
        let action, data;
        try {
            ({ action, data } = JSON.parse(message));
        } catch (error) {
            return ws.send(JSON.stringify({ error: 'Invalid JSON' }));
        }

        // Authentification : cas unique où l'utilisateur n'a pas besoin d'être loggé
        if (action === 'set-user') {
            this.onSetUser(ws, data);
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
                this.onNewMessage(ws, data);
                break;
            case 'new-conversation':
                this.onNewConversation(ws, data);
                break;
            case 'join-conversation':
                this.onJoinConversation(ws, data);
                break;
            case 'leave-conversation':
                this.onLeaveConversation(ws, data);
                break;
            case 'search-users':
                this.onSearchUsers(ws, data);
                break;
            default:
                ws.send(JSON.stringify({ error: 'Action not found' }));
                return;
        }
    }

    async onSearchUsers(ws, data) {
        // Récupérer les utilisateurs
        try {
            let users = await userController.search_users(data);
            return ws.send(JSON.stringify({ action: 'search-users', data: users }));
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    async onJoinConversation(ws, data) {
        // Ajouter l'utilisateur à la conversation
        try {
            let updatedConversation = await messageController.join_conversation(data);
            return ws.send(JSON.stringify({ action: 'join-conversation', data: updatedConversation }));
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    async onLeaveConversation(ws, data) {
        // Supprimer l'utilisateur de la conversation
        try {
            let updatedConversation = await messageController.leave_conversation(data);
            return ws.send(JSON.stringify({ action: 'leave-conversation', data: updatedConversation }));
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    async onNewConversation(ws, data) {
        // Créer la conversation
        try {
            let newConversation = await messageController.new_conversation(data);
            return ws.send(JSON.stringify({ action: 'new-conversation', data: newConversation }));
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    async onSetUser(ws, data) {
        // Vérifier les données
        let { user } = data;
        if (!user) {
            ws.send(JSON.stringify({ error: 'User is required' }));
            return;
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
            let conversations = await messageController.get_conversations(data);
            return ws.send(JSON.stringify({ action: 'get-conversations', data: conversations }));
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    async onNewMessage(ws, data) {
        const { content, conversation } = data;

        // Créer le message et broadcaster
        try {
            // Créer le message avec le controller
            const createdMessage = await messageController.new_message({ ...data, sender: ws.user });

            // Récupérer l'ID des autres utilisateurs dans la conversation
            let others = await Conversation.findById(conversation, 'users');
            others = others.users.map((user) => user.toString());

            // Broadcast le message aux autres utilisateurs
            console.log('Broadcasting to', others);
            this.clients.forEach((client) => {
                console.log('Client', client.user);
                let shouldSend = client.readyState === ws.OPEN && others.includes(client.user);
                if (shouldSend) {
                    client.send(JSON.stringify({ action: 'new-message', data: createdMessage }));
                }
            });

            this.specialMessageHandling(ws, content);
        } catch (error) {
            return ws.send(JSON.stringify({ error: error.message }));
        }
    }

    specialMessageHandling(ws, content) {
        // Check si le message contient des mots spéciaux
        if (content === 'ping') {
            return ws.send(JSON.stringify({ action: 'new-special-message', data: { content: 'pong' } }));
        }

        // Check si le message finit par 'quoi'
        let quoiWords = ['quoi', 'quoi?', 'quoi ?', 'quoi !', 'quoi !?', 'quoi ! ?']
        if (quoiWords.some((word) => content.endsWith(word))) {
            return ws.send(JSON.stringify({ action: 'new-special-message', data: { content: 'feur' } }));
        }

        // Check si le message finit par un mot divin 🙏 Amen
        let divineWords = ['st', 'saint', 'sein', 'sin', 'sain', 'saints']
        let divineSaints = ['tropez','glé','tre','crusté','doux','jecter','carné','cope','port-export','refait','toxiqué','con-pétant','gurgite','primante','razin', 'plomb-95', 'pagnan', 'pathoche', 'ture', 'secte', 'clinaison', 'fusion']
        if (divineWords.some((word) => content.endsWith(word))) {
            // Récupérer un saint aléatoire
            let saint = divineSaints[Math.floor(Math.random() * divineSaints.length)];
            return ws.send(JSON.stringify({ action: 'new-special-message', data: { content: `✝🙏 Saint-${saint} 🙏✝` }}));
        }
    }
}

module.exports = ChatWS;
