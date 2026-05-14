#!/bin/bash

# BharatSecure Deployment Script
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 BharatSecure Deployment Helper"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    echo "Checking requirements..."
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    print_success "Python 3 found"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm found"
    
    echo ""
}

# Generate Django secret key
generate_secret_key() {
    echo "Generating Django SECRET_KEY..."
    SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
    echo ""
    print_success "Generated SECRET_KEY:"
    echo "$SECRET_KEY"
    echo ""
    print_warning "Save this key securely and add it to your environment variables!"
    echo ""
}

# Test backend
test_backend() {
    echo "Testing backend..."
    cd backend
    
    if [ ! -d "venv" ]; then
        print_warning "Virtual environment not found. Creating..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    echo "Installing dependencies..."
    pip install -q -r requirements.txt
    
    echo "Running Django checks..."
    python manage.py check
    
    echo "Checking for migrations..."
    python manage.py makemigrations --dry-run --check
    
    print_success "Backend tests passed!"
    
    deactivate
    cd ..
    echo ""
}

# Test frontend
test_frontend() {
    echo "Testing frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_warning "Node modules not found. Installing..."
        npm install
    fi
    
    echo "Building frontend..."
    npm run build
    
    print_success "Frontend build successful!"
    
    cd ..
    echo ""
}

# Deploy to Railway
deploy_railway() {
    echo "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed"
        echo "Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    cd backend
    railway up
    print_success "Backend deployed to Railway!"
    
    echo "Running migrations..."
    railway run python manage.py migrate
    
    echo "Collecting static files..."
    railway run python manage.py collectstatic --noinput
    
    cd ..
    echo ""
}

# Deploy to Vercel
deploy_vercel() {
    echo "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed"
        echo "Install with: npm install -g vercel"
        exit 1
    fi
    
    cd frontend
    vercel --prod
    print_success "Frontend deployed to Vercel!"
    
    cd ..
    echo ""
}

# Docker deployment
deploy_docker() {
    echo "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    echo "Building and starting containers..."
    docker-compose up -d --build
    
    echo "Waiting for services to start..."
    sleep 10
    
    echo "Running migrations..."
    docker-compose exec backend python manage.py migrate
    
    echo "Collecting static files..."
    docker-compose exec backend python manage.py collectstatic --noinput
    
    print_success "Docker deployment complete!"
    echo "Backend: http://localhost:8000"
    echo "Frontend: http://localhost:80"
    echo ""
}

# Main menu
show_menu() {
    echo "What would you like to do?"
    echo ""
    echo "1) Generate Django SECRET_KEY"
    echo "2) Test Backend"
    echo "3) Test Frontend"
    echo "4) Deploy to Railway (Backend)"
    echo "5) Deploy to Vercel (Frontend)"
    echo "6) Deploy with Docker (Local/VPS)"
    echo "7) Full Cloud Deployment (Railway + Vercel)"
    echo "8) Run all tests"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
    
    case $choice in
        1)
            generate_secret_key
            ;;
        2)
            test_backend
            ;;
        3)
            test_frontend
            ;;
        4)
            deploy_railway
            ;;
        5)
            deploy_vercel
            ;;
        6)
            deploy_docker
            ;;
        7)
            test_backend
            test_frontend
            deploy_railway
            deploy_vercel
            print_success "Full deployment complete!"
            ;;
        8)
            test_backend
            test_frontend
            print_success "All tests passed!"
            ;;
        9)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Run the script
check_requirements
show_menu
