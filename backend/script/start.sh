#!/bin/bash

# Change to the frontend directory
cd ../../frontend

# Install packages with yarn
yarn install

# Start frontend
yarn dev

# Change to node.js directory
cd ../backend/node-script

# Install packages with yarn
yarn install

# Patch "@zk-email/helpers" package
yarn patch-package

# Change back to the project root
cd ../script

# Start backend server
cargo run --release