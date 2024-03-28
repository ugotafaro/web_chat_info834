#!/bin/bash

# Get the PIDs of all mongod processes
mongod_pids=$(ps -ef | grep mongod | grep -v grep | awk '{print $2}')

# Check if mongod processes are running
if [ -n "$mongod_pids" ]; then
    # Terminate each mongod process
    for pid in $mongod_pids; do
        kill "$pid"
    done
    echo "mongod processes terminated."
else
    echo "No mongod processes found."
fi