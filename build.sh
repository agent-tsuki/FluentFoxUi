#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting FluentFox UI build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Build the application
echo "🏗️ Building the application..."
npm run build

echo "✅ Build completed successfully!"