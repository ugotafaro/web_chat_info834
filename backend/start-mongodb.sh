#!/bin/bash
gnome-terminal --tab --title="rs0 27018" -- bash -c 'mongod --port 27018 --dbpath ./data/rs0 --replSet rs0;';
gnome-terminal --tab --title="rs0 27019" -- bash -c 'mongod --port 27019 --dbpath ./data/rs1 --replSet rs0;';
gnome-terminal --tab --title="rs0 27020" -- bash -c 'mongod --port 27020 --dbpath ./data/rs2 --replSet rs0;';
gnome-terminal --tab --title="rs0 30000" -- bash -c 'mongod --port 30000 --dbpath ./data/arb --replSet rs0 --arbiter;';
