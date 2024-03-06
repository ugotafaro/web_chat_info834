const WS = require('ws');
const messageController = require('./controllers/MessageController');
const { client } = require('./redis.js');

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
        const { action, data } = JSON.parse(message);

        // Unique case where ws.user is not required
        if (action === 'set-user') {
            let { user } = data;
            this.onSetUser(ws, user);
            return;
        }

        // Check if ws.user is set
        if(!ws.user) return;

        // Act
        switch (action) {
            case 'new-message':
                let { content, conversation } = data;
                this.onNewMessage(ws, content, conversation);
                break;
            default:
                return;
        }
    }

    onClose() {
        console.log(`[WS] Connexion fermée (${this.clients.size} clients)`);
    }

    onError(error) {
        console.error('[WS] Erreur ', error);
    }

    async onSetUser(ws, user) {
        if (!user) return;

        // Check if user is connected in Redis
        let exists = await client.exists(`user:${user}`);
        if (exists === 0) return;
        ws.user = user;
        console.log(`[WS] ${user} connecté`);
    }

    async onNewMessage(ws, content, conversation) {
        // Main logic for message handling
        try {
            // Create message using controller
            const createdMessage = await messageController.new_message(content, ws.user, conversation);
            console.log('Message created:', createdMessage);

            // Check if message is a ping
            if (content === 'ping') {
                ws.send(JSON.stringify({ content: 'pong' }));
                return;
            }

            let quoiWords = ['quoi', 'quoi?', 'quoi ?', 'quoi !', 'quoi !?', 'quoi ! ?']

            // Check if message ends in 'quoi'
            if (quoiWords.some((word) => content.endsWith(word))) {
                ws.send(JSON.stringify({ content: 'feur' }));
                return;
            }

            let divineWords = ['st', 'saint', 'sein', 'sin', 'sain', 'saints']
            let divineSaints = ['tropez','glé','tre','crusté','doux','jecter','carné','cope','port-export','refait','toxiqué','con-pétant','gurgite','primante','razin', 'plomb-95', 'pagnan', 'pathoche', 'ture', 'secte', 'clinaison', 'fusion']

            // Check if message ends with 'saint'
            if (divineWords.some((word) => content.endsWith(word))) {
                // Get random divine saint
                let saint = divineSaints[Math.floor(Math.random() * divineSaints.length)];
                ws.send(JSON.stringify({ content: `✝🙏 Saint-${saint} 🙏✝` }));
                return;
            }

            // TODO : Broadcast
            // Display clients size
            console.log(`[WS] ${this.clients.size} clients`);
            // this.clients.forEach((client) => {
            //     if (client !== ws && client.readyState === ws.OPEN) {
            //         if(client.userid in myfriends) client.send(message);
            //     }
            // });
        } catch (error) {
            console.error('Error creating message:', error.message);
        }
    }
}

module.exports = ChatWS;
