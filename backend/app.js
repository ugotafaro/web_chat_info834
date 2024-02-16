const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require("./db")
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  // parsing URL-encoded form data

// Routes
const routes = require('./routes');
app.use('/api', routes);

// Launch
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[INFO] Server up sur http://localhost:${port}`);
});


