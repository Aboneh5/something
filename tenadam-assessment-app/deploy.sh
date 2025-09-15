#!/bin/bash

# Tenadam Assessment App Deployment Script
# Run this script on your VPS

echo "🚀 Starting Tenadam Assessment App Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
echo "🐳 Installing Docker and Docker Compose..."
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install PM2 for process management
echo "⚡ Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/tenadam-assessment
sudo chown $USER:$USER /var/www/tenadam-assessment
cd /var/www/tenadam-assessment

# Clone repository (if not already cloned)
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/your-username/tenadam-assessment-app.git .
fi

# Pull latest changes
echo "🔄 Pulling latest changes..."
git pull origin main

# Create environment file
echo "⚙️ Setting up environment variables..."
cp env.production.example .env
echo "Please edit .env file with your production values:"
echo "nano .env"

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build applications
echo "🔨 Building applications..."
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# Start with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Setup Nginx
echo "🌐 Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/tenadam-assessment
sudo ln -s /etc/nginx/sites-available/tenadam-assessment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt (optional)
echo "🔒 Setting up SSL (optional)..."
echo "To setup SSL, run: sudo certbot --nginx -d bef.tenadamconsulting.com"

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at: https://bef.tenadamconsulting.com"
echo "📊 Admin panel: https://bef.tenadamconsulting.com/admin"
echo "🔐 Admin login: admin@tenadam.com / password"
