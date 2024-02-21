const express =     require('express');
const cors =        require('cors');
const http =        require('http');
const bodyParser =  require('body-parser');
const db =          require('./db.js');
const ChatWS = require('./websocket.js');

// App
const app = express();
const server = http.createServer(app);
const wss = new ChatWS(server);

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
  console.log(`[INFO] Server up sur http://localhost:${port}`);
});