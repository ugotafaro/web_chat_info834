const ws = require('ws');

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

    onMessage(ws, message) {
        let data = JSON.parse(message);
        // console.log(`[WS] Receiving \"${data['content']}\"`);

        if (data['content'] === 'ping') {
            ws.send(JSON.stringify({ content: 'pong' }));
        }


        // TODO : Broadcast
        // this.clients.forEach((client) => {
        //     if (client !== ws && client.readyState === ws.OPEN) {
        //         client.send(message);
        //     }
        // });
    }

    onClose(ws) {
        console.log('[WS] Connexion fermée');
    }

    onError(error) {
        console.error('[WS] Erreur ', error);
    }
}

module.exports = ChatWS;
