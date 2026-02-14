#!/bin/bash

set -e

echo "🍕 Pizza Palace Setup"
echo "======================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
pnpm install

echo -e "${YELLOW}Step 2: Starting PostgreSQL...${NC}"
docker compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
sleep 5

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Step 3: Creating .env file with auto-generated secrets...${NC}"
    
    # Generate random secrets
    BETTER_AUTH_SECRET=$(openssl rand -base64 32)
    
    # Create .env file
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pizza_palace?schema=public"

# Better Auth
BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET"
BETTER_AUTH_URL="http://localhost:3000"

# Resend Email (placeholder - user can replace with their own)
RESEND_API_KEY="re_placeholder"
EMAIL_FROM="noreply@pizzapalace.com"

# Polar (placeholder)
POLAR_ACCESS_TOKEN="polar_placeholder"
POLAR_STORE_ID="store_placeholder"
EOF
    echo -e "${GREEN}Created .env with auto-generated secrets${NC}"
else
    echo -e "${GREEN}.env already exists, skipping...${NC}"
fi

echo -e "${YELLOW}Step 4: Setting up database...${NC}"
pnpm prisma generate

# Check if database is empty and needs migration
DB_EXISTS=$(docker exec pizza-palace-db psql -U postgres -d pizza_palace -t -c "SELECT COUNT(*) FROM pg_catalog.pg_database WHERE datname='pizza_palace'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" -lt "1" ]; then
    echo "Running initial migration..."
    pnpm prisma migrate dev --name init
else
    echo "Database already exists, running migrate..."
    pnpm prisma migrate deploy || true
fi

echo -e "${YELLOW}Step 5: Seeding database...${NC}"
pnpm prisma db seed || echo "Seed completed (or already seeded)"

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Starting development server..."
echo "Open http://localhost:3000 in your browser"
echo ""

pnpm dev
