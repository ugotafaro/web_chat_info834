# INFO834 - ✝Messagé
Une application de web chat en temps réel.

Coté backend : Node fournit une API REST avec Express, ainsi qu'un système de web socket pour diffuser les messages en temps-réel. Tout est lié à une base de données MongoDB et à un cache Redis.

Coté frontend : Angular fournit le frontend et accède à l'API.

![techstack](./techstack.png)

# Installation
Avant de passez à la partie launch, pensez à télécharger les dépendances:
- `cd frontend; npm install; cd ../backend; npm install;`

# Launch
Pour lancer l'appli, utiliser trois terminals bash :
- Pour le frontend -> `cd frontend; ng serve;`
- Pour le backend -> `cd backend; node app.js;` ou `cd backend; npm run dev;` pour le dev
- Pour le serveur Redis (avec un terminal **WSL**) -> `redis-server --port 6379`
Deux possibilités pour MongoDB
- En remote (sans réplicats) -> Se connectez au VPN de polytech
- En local -> `cd backend; mongod --replSet rs0 --port 27018 --dbpath ./data/rs0`
- En local (avec réplicats sets)

` db.adminCommand({ "setDefaultRWConcern": 1, "defaultWriteConcern": { "w": 1 }})`

`cd backend; mongod --port 30000 --dbpath ./data/arb --replSet rs0`

# Testing (optionnel)
- Pour tester Redis (terminal **WSL**) -> `redis-cli`
Deux possibilités pour MongoDB
- En remote -> `mongosh --host 193.48.125.44 --port 27017 --username scadereau --password haa00` puis `use hugougolois`
- En local -> `mongosh --port 27018` puis `rs.initiate(); rs.add('localhost:27019'); rs.add('localhost:27020');`

# Redis
Commandes pour tester redis, à lancer sur le client Redis
- `FLUSHDB` pour vider les données
- `KEYS *` pour voir toutes les données
- `HGETALL user:65ddc1ac007f09cc725ad3a6` pour récupérer les infos d'un utilisateur
- `DEL user:65ddc1ac007f09cc725ad3a6` pour déconnecter un utilisateur

# MongoDB
Commandes pour tester MongoDB, à lancer sur le client MongoDB
- `db.users.find()` voir tout les utilisateurs
- `show collections` voir tout les schémas
