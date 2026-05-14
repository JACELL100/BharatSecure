# BharatSecure Deployment Script for Windows
# PowerShell version

$ErrorActionPreference = "Stop"

Write-Host "🚀 BharatSecure Deployment Helper" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored output
function Print-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Check if required tools are installed
function Check-Requirements {
    Write-Host "Checking requirements..."
    
    if (!(Get-Command python -ErrorAction SilentlyContinue)) {
        Print-Error "Python is not installed"
        exit 1
    }
    Print-Success "Python found"
    
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Print-Error "Node.js is not installed"
        exit 1
    }
    Print-Success "Node.js found"
    
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Print-Error "npm is not installed"
        exit 1
    }
    Print-Success "npm found"
    
    Write-Host ""
}

# Generate Django secret key
function Generate-SecretKey {
    Write-Host "Generating Django SECRET_KEY..."
    $SecretKey = python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    Write-Host ""
    Print-Success "Generated SECRET_KEY:"
    Write-Host $SecretKey
    Write-Host ""
    Print-Warning "Save this key securely and add it to your environment variables!"
    Write-Host ""
}

# Test backend
function Test-Backend {
    Write-Host "Testing backend..."
    Set-Location backend
    
    if (!(Test-Path "venv")) {
        Print-Warning "Virtual environment not found. Creating..."
        python -m venv venv
    }
    
    .\venv\Scripts\Activate.ps1
    
    Write-Host "Installing dependencies..."
    pip install -q -r requirements.txt
    
    Write-Host "Running Django checks..."
    python manage.py check
    
    Write-Host "Checking for migrations..."
    python manage.py makemigrations --dry-run --check
    
    Print-Success "Backend tests passed!"
    
    deactivate
    Set-Location ..
    Write-Host ""
}

# Test frontend
function Test-Frontend {
    Write-Host "Testing frontend..."
    Set-Location frontend
    
    if (!(Test-Path "node_modules")) {
        Print-Warning "Node modules not found. Installing..."
        npm install
    }
    
    Write-Host "Building frontend..."
    npm run build
    
    Print-Success "Frontend build successful!"
    
    Set-Location ..
    Write-Host ""
}

# Deploy to Railway
function Deploy-Railway {
    Write-Host "Deploying to Railway..."
    
    if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
        Print-Error "Railway CLI is not installed"
        Write-Host "Install with: npm install -g @railway/cli"
        exit 1
    }
    
    Set-Location backend
    railway up
    Print-Success "Backend deployed to Railway!"
    
    Write-Host "Running migrations..."
    railway run python manage.py migrate
    
    Write-Host "Collecting static files..."
    railway run python manage.py collectstatic --noinput
    
    Set-Location ..
    Write-Host ""
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Host "Deploying to Vercel..."
    
    if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
        Print-Error "Vercel CLI is not installed"
        Write-Host "Install with: npm install -g vercel"
        exit 1
    }
    
    Set-Location frontend
    vercel --prod
    Print-Success "Frontend deployed to Vercel!"
    
    Set-Location ..
    Write-Host ""
}

# Docker deployment
function Deploy-Docker {
    Write-Host "Deploying with Docker..."
    
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Print-Error "Docker is not installed"
        exit 1
    }
    
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Print-Error "Docker Compose is not installed"
        exit 1
    }
    
    Write-Host "Building and starting containers..."
    docker-compose up -d --build
    
    Write-Host "Waiting for services to start..."
    Start-Sleep -Seconds 10
    
    Write-Host "Running migrations..."
    docker-compose exec backend python manage.py migrate
    
    Write-Host "Collecting static files..."
    docker-compose exec backend python manage.py collectstatic --noinput
    
    Print-Success "Docker deployment complete!"
    Write-Host "Backend: http://localhost:8000"
    Write-Host "Frontend: http://localhost:80"
    Write-Host ""
}

# Main menu
function Show-Menu {
    Write-Host "What would you like to do?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) Generate Django SECRET_KEY"
    Write-Host "2) Test Backend"
    Write-Host "3) Test Frontend"
    Write-Host "4) Deploy to Railway (Backend)"
    Write-Host "5) Deploy to Vercel (Frontend)"
    Write-Host "6) Deploy with Docker (Local/VPS)"
    Write-Host "7) Full Cloud Deployment (Railway + Vercel)"
    Write-Host "8) Run all tests"
    Write-Host "9) Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice [1-9]"
    
    switch ($choice) {
        1 { Generate-SecretKey }
        2 { Test-Backend }
        3 { Test-Frontend }
        4 { Deploy-Railway }
        5 { Deploy-Vercel }
        6 { Deploy-Docker }
        7 {
            Test-Backend
            Test-Frontend
            Deploy-Railway
            Deploy-Vercel
            Print-Success "Full deployment complete!"
        }
        8 {
            Test-Backend
            Test-Frontend
            Print-Success "All tests passed!"
        }
        9 {
            Write-Host "Goodbye!"
            exit 0
        }
        default {
            Print-Error "Invalid choice"
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
    Show-Menu
}

# Run the script
Check-Requirements
Show-Menu
