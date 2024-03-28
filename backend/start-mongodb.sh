#!/bin/bash

# Create directories if they don't exist

mkdir -p ./data/R0S1
mkdir -p ./data/R0S2
mkdir -p ./data/R0S3
mkdir -p ./data/R0S4
mkdir -p ./data/arb

# Start mongod instances
mongod --replSet rs0 --port 27018 --dbpath ./data/R0S1 &
mongod --replSet rs0 --port 27019 --dbpath ./data/R0S2 &
mongod --replSet rs0 --port 27020 --dbpath ./data/R0S3 &
mongod --replSet rs0 --port 27021 --dbpath ./data/R0S4 &
mongod --port 30000 --dbpath ./data/arb --replSet rs0 &

# Wait for mongod instances to start
sleep 5

# Open a mongo shell and initiate the replica set
mongo --port 27018 --eval 'rs.initiate(); rs.add("localhost:27019"); rs.add("localhost:27020"); rs.add("localhost:27021"); rs.addArb("localhost:30000"); rs.status();'

