#!/bin/bash

# Exit on any error
set -e

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building client..."
cd client
npm install
npm run build
cd ..

echo "🚀 Ready for deployment!"
echo "Run 'npm start' to start the production server."