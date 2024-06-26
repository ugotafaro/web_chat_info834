const express =     require('express');
const cors =        require('cors');
const bodyParser =  require('body-parser');
const ChatWS =      require('./websocket.js');

// Database (MongoDB)
const db = require('./db.js');

// App
const app = express();

// WebSocket
const wss = new ChatWS({ port: 3030 });

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const routes = require('./routes');
app.use('/api', routes);

// Launch
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[INFO] Server up (http://localhost:${port})`);
});