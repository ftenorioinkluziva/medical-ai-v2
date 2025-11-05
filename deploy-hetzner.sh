#!/bin/bash

# Medical AI v2 - Hetzner Deployment Script
# This script helps deploy the application to a Hetzner server

set -e

echo "🚀 Medical AI v2 - Hetzner Deployment"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER=${SERVER_USER:-root}
SERVER_HOST=${SERVER_HOST}
APP_DIR=${APP_DIR:-/opt/medical-ai-v2}

# Check if server host is provided
if [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}Error: SERVER_HOST environment variable is not set${NC}"
    echo "Usage: SERVER_HOST=your-server-ip ./deploy-hetzner.sh"
    exit 1
fi

echo -e "${GREEN}✓${NC} Target server: ${SERVER_USER}@${SERVER_HOST}"
echo -e "${GREEN}✓${NC} Application directory: ${APP_DIR}"
echo ""

# Step 1: Check SSH connection
echo "📡 Checking SSH connection..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} echo "Connected" 2>&1 | grep -q "Connected"; then
    echo -e "${GREEN}✓${NC} SSH connection successful"
else
    echo -e "${RED}✗${NC} SSH connection failed. Please check your credentials and server access."
    exit 1
fi

# Step 2: Install Docker on server (if not installed)
echo ""
echo "🐳 Checking Docker installation..."
if ssh ${SERVER_USER}@${SERVER_HOST} "command -v docker &> /dev/null"; then
    echo -e "${GREEN}✓${NC} Docker is already installed"
else
    echo -e "${YELLOW}⚠${NC} Docker not found. Installing..."
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
        # Update package list
        apt-get update

        # Install prerequisites
        apt-get install -y ca-certificates curl gnupg lsb-release

        # Add Docker's official GPG key
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg

        # Set up repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        # Start Docker service
        systemctl start docker
        systemctl enable docker

        echo "Docker installed successfully"
ENDSSH
    echo -e "${GREEN}✓${NC} Docker installed"
fi

# Step 3: Create application directory
echo ""
echo "📁 Creating application directory..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${APP_DIR}"
echo -e "${GREEN}✓${NC} Directory created: ${APP_DIR}"

# Step 4: Copy files to server
echo ""
echo "📦 Copying application files to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.env.local' \
    --exclude '.env' \
    ./ ${SERVER_USER}@${SERVER_HOST}:${APP_DIR}/

echo -e "${GREEN}✓${NC} Files copied successfully"

# Step 5: Setup environment variables
echo ""
echo "🔐 Setting up environment variables..."
echo -e "${YELLOW}⚠${NC} Please create/update .env.production file on the server with your production credentials"
echo ""
echo "Example: ssh ${SERVER_USER}@${SERVER_HOST} \"nano ${APP_DIR}/.env.production\""
echo ""
read -p "Press enter when you have configured the environment variables..."

# Step 6: Build and start containers
echo ""
echo "🏗️  Building and starting Docker containers..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd ${APP_DIR}

    # Stop existing containers
    docker compose down 2>/dev/null || true

    # Build and start containers
    docker compose up -d --build

    # Wait for services to be healthy
    echo "Waiting for services to start..."
    sleep 10

    # Check container status
    docker compose ps
ENDSSH

echo -e "${GREEN}✓${NC} Containers started"

# Step 7: Run database migrations
echo ""
echo "🗄️  Running database migrations..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd ${APP_DIR}

    # Run migrations inside the app container
    docker compose exec -T app sh -c "npx drizzle-kit migrate"
ENDSSH

echo -e "${GREEN}✓${NC} Database migrations completed"

# Step 8: Seed database (optional)
echo ""
read -p "Do you want to seed the database with default agents? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
        cd ${APP_DIR}
        docker compose exec -T app sh -c "npm run db:seed"
ENDSSH
    echo -e "${GREEN}✓${NC} Database seeded"
fi

# Step 9: Show deployment info
echo ""
echo "======================================"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "======================================"
echo ""
echo "📊 Container Status:"
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${APP_DIR} && docker compose ps"
echo ""
echo "🌐 Application container running on port 3002"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Nginx Proxy Manager:"
echo "      - Access NPM panel: http://${SERVER_HOST}:81"
echo "      - Add Proxy Host: your-domain.com -> localhost:3002"
echo "      - Enable SSL with Let's Encrypt"
echo ""
echo "   2. Your application will be available at:"
echo "      https://your-domain.com"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${APP_DIR} && docker compose logs -f'"
echo "   Restart app:   ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${APP_DIR} && docker compose restart app'"
echo "   Stop all:      ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${APP_DIR} && docker compose down'"
echo "   Update app:    ./deploy-hetzner.sh"
echo ""
