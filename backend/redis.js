const { promisify } = require('util');
const redis = require('redis');
const client = redis.createClient();

client.on('error', () => { console.error('[INFO] Echec de connexion à Redis (lancer redis-server)'); });
client.on('connect', () => { console.log('[INFO] Redis up (localhost:6379)'); });

client.connect();

const getAsync = promisify(client.get).bind(client);

module.exports = {
  client,
  getAsync,
};
