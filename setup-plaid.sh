#!/bin/bash

# GlideMoney Plaid Setup Script
# This script helps set up Plaid sandbox integration

echo "🏦 GlideMoney Plaid Setup Script"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the GlideMoney app root directory"
    exit 1
fi

echo "📋 Setting up Plaid sandbox integration..."
echo ""

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Frontend .env created from template"
    echo "⚠️  Please edit .env with your Plaid credentials"
else
    echo "✅ Frontend .env already exists"
fi

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Backend .env created from template"
    echo "⚠️  Please edit backend/.env with your Plaid credentials"
else
    echo "✅ Backend .env already exists"
fi

echo ""
echo "🔧 Installing backend dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "🚀 Starting backend server..."
echo "   Backend will run on http://localhost:3001"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the backend server
npm start
