const WebSocket = require('ws');

class ChatWS extends WebSocket.Server {
    constructor(server) {
        super({ server });
        server.on('connection', this.onConnection.bind(this));
        server.on('listening', this.onListening.bind(this));
        server.on('close', this.onClose.bind(this));
    }

    onListening() {
        console.log('[INFO] WebSocket server is listening');
    }

    onConnection(ws) {
        console.log('[INFO] New WebSocket connection');

        ws.on('message', this.onMessage.bind(this, ws));
        ws.on('close', this.onClose.bind(this, ws));
    }

    onMessage(ws, message) {
        console.log('[INFO] Received message:', message);

        // Add your custom message handling logic here
        // For example, you can broadcast the message to all connected clients
        this.wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
        });
    }

    onClose(ws) {
        console.log('[INFO] WebSocket connection closed');
    }
}

module.exports = ChatWS;
