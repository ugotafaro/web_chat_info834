const { promisify } = require('util');
const redis = require('redis');
const client = redis.createClient();

client.on('error', () => { console.error('[INFO] Redis up sur :6379 (lancer redis-server)'); });
client.on('connect', () => { console.log('[INFO] Redis up sur :6379'); });

client.connect();

const getAsync = promisify(client.get).bind(client);

module.exports = {
  client,
  getAsync,
};
