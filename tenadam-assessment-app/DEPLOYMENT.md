# 🚀 Tenadam Assessment App - VPS Deployment Guide

This guide will help you deploy the Tenadam Assessment App to your Yegara Host VPS.

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ (Yegara Host)
- Domain name pointing to your VPS IP (bef.tenadamconsulting.com)
- SSH access to your VPS
- GitHub repository with the code

## 🔧 Step-by-Step Deployment

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### Step 2: Update System and Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 3: Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/tenadam-assessment
sudo chown $USER:$USER /var/www/tenadam-assessment
cd /var/www/tenadam-assessment

# Clone your repository
git clone https://github.com/your-username/tenadam-assessment-app.git .

# Make deploy script executable
chmod +x deploy.sh
```

### Step 4: Configure Environment Variables

```bash
# Copy environment template
cp env.production.example .env

# Edit environment variables
nano .env
```

Update the following values in `.env`:
```env
# Database
POSTGRES_PASSWORD=your_very_secure_password_here
DATABASE_URL=postgresql://tenadam_user:your_very_secure_password_here@localhost:5432/tenadam_assessment

# Backend
NODE_ENV=production
PORT=5001

# Frontend
NEXT_PUBLIC_API_URL=https://bef.tenadamconsulting.com/api
```

### Step 5: Install Dependencies and Build

```bash
# Install backend dependencies
cd backend
npm install
npm run build
cd ..

# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..
```

### Step 6: Setup Database

```bash
# Generate Prisma client
cd backend
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database
npm run db:seed
cd ..
```

### Step 7: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/tenadam-assessment

# Update domain name in Nginx config
sudo nano /etc/nginx/sites-available/tenadam-assessment

# Enable the site
sudo ln -s /etc/nginx/sites-available/tenadam-assessment /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Start Services

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Option B: Using PM2 (Alternative)

```bash
# Start backend
cd backend
pm2 start dist/index.js --name "tenadam-backend"
cd ..

# Start frontend
cd frontend
pm2 start npm --name "tenadam-frontend" -- start
cd ..

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 9: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d bef.tenadamconsulting.com -d www.bef.tenadamconsulting.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 10: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Frontend (if not using Nginx proxy)
sudo ufw allow 5001  # Backend (if not using Nginx proxy)

# Enable firewall
sudo ufw enable
```

## 🔍 Verification

### Check Services Status

```bash
# Check Docker containers
docker-compose ps

# Check Nginx status
sudo systemctl status nginx

# Check application logs
docker-compose logs -f
```

### Test Application

1. **Frontend**: Visit `https://bef.tenadamconsulting.com`
2. **Admin Panel**: Visit `https://bef.tenadamconsulting.com/admin`
3. **API Health**: Visit `https://bef.tenadamconsulting.com/api/health`

### Admin Access

- **URL**: `https://bef.tenadamconsulting.com/admin`
- **Email**: `admin@tenadam.com`
- **Password**: `password`

### User Access

- **URL**: `https://bef.tenadamconsulting.com/assessment/entry`
- **Access Code**: `TENADAM1301SRS`

## 🛠️ Maintenance Commands

### Update Application

```bash
cd /var/www/tenadam-assessment
git pull origin main
docker-compose down
docker-compose up -d --build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U tenadam_user tenadam_assessment > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U tenadam_user tenadam_assessment < backup.sql
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :5001
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   docker-compose logs postgres
   docker-compose restart postgres
   ```

3. **Nginx Configuration Issues**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Permission Issues**
   ```bash
   sudo chown -R $USER:$USER /var/www/tenadam-assessment
   ```

### Log Locations

- **Application Logs**: `docker-compose logs`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `journalctl -u nginx`

## 📞 Support

If you encounter any issues during deployment, check:

1. All services are running: `docker-compose ps`
2. Nginx configuration: `sudo nginx -t`
3. Application logs: `docker-compose logs -f`
4. Firewall settings: `sudo ufw status`

## 🎉 Success!

Once deployed, your Tenadam Assessment App will be available at:
- **Main App**: `https://bef.tenadamconsulting.com`
- **Admin Panel**: `https://bef.tenadamconsulting.com/admin`
- **API**: `https://bef.tenadamconsulting.com/api`
