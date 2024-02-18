# INFO734 todo list
Une application Node construite avec MongoDB et Angular.

Node fournit une API RESTful (avec Express) lié MongoDB.

Angular fournit le frontend et accède à l'API.

# Launch
Pour lancer l'appli, utiliser trois terminals bash :
- Pour le frontend -> `cd frontend; ng serve;`
- Pour le backend -> `cd backend; node app.js;` ou `cd backend; npm run dev;` pour le dev
- Pour le serveur Redis (avec un terminal **WSL**) -> `redis-server --port 6379`
Pensez à vous connectez au VPN pour avoir accès à la base Mongos

- (optionel) Pour tester Redis (terminal **WSL**) -> `redis-cli`
- (optionel) Pour tester MongoDB -> `mongosh --host 193.48.125.44 --port 27017 --username scadereau --password haa00` puis `use hugougolois`

# Redis
Commandes pour tester redis, à lancer sur le client Redis
`FLUSHDB` pour vider les données
`KEYS *` pour voir toutes les données

# MongoDB
Commandes pour tester MongoDB, à lancer sur le client MongoDB
`db.users.find()` voir tout les utilisateurs
`show collections` voir tout les schémas
