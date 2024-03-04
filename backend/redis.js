const { promisify } = require('util');
const redis = require('redis');
const client = redis.createClient();

client.on('error', err => { console.error('[INFO] Erreur de connexion à Redis:', err); });
client.on('connect', () => { console.log('[INFO] Connexion à Redis réussie'); });

client.connect();

const getAsync = promisify(client.get).bind(client);

module.exports = {
  client,
  getAsync,
};
