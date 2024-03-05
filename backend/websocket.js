const ws = require('ws');
const messageController = require('./controllers/MessageController');

class ChatWS extends  ws.WebSocketServer {
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
        console.log('[WS] Nouvelle connexion');1

        // Send hello to client
        let message = JSON.stringify({ content: 'Hello from server' });
        ws.send(message);

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
            const { content, sender, conversation } = data;
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

    onClose(ws) {
        console.log('[WS] Connexion fermée');
        console.log(`[WS] ${this.clients.size} clients`);
    }

    onError(error) {
        console.error('[WS] Erreur ', error);
    }
}

module.exports = ChatWS;
