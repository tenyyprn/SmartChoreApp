# Smart Chore App - One-click Setup for compact-haiku-454409-j0 (Windows PowerShell)
# This script sets up everything needed for the hackathon

$ErrorActionPreference = "Stop"

$PROJECT_ID = "compact-haiku-454409-j0"
$REGION = "us-central1"

Write-Host "🚀 Smart Chore App - Hackathon Setup for $PROJECT_ID" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🛡️ 既存アプリケーションには影響しません" -ForegroundColor Yellow

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check gcloud
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Download: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Download: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Check npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js/npm is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All prerequisites met!" -ForegroundColor Green

# Set up gcloud project
Write-Host "🔧 Setting up Google Cloud project..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Enable all required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Cyan
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Yellow
Write-Host "   ℹ️ 既存APIが有効な場合はスキップされます" -ForegroundColor Yellow

try {
    gcloud services enable cloudbuild.googleapis.com --quiet
    gcloud services enable run.googleapis.com --quiet
    gcloud services enable firestore.googleapis.com --quiet
    gcloud services enable aiplatform.googleapis.com --quiet
    gcloud services enable calendar-json.googleapis.com --quiet
    gcloud services enable containerregistry.googleapis.com --quiet
    
    Write-Host "✅ APIs enabled successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Some APIs may already be enabled or need manual activation" -ForegroundColor Yellow
}

# Set up Docker authentication
Write-Host "🔧 Setting up Docker authentication..." -ForegroundColor Cyan
gcloud auth configure-docker --quiet

# Create service account for Vertex AI
Write-Host "🤖 Creating Vertex AI service account..." -ForegroundColor Cyan
try {
    # Check if service account exists
    $serviceAccountExists = gcloud iam service-accounts describe "vertex-ai-chore@$PROJECT_ID.iam.gserviceaccount.com" 2>$null
    
    if (!$serviceAccountExists) {
        gcloud iam service-accounts create vertex-ai-chore `
            --display-name="Vertex AI for Chore App" `
            --project=$PROJECT_ID `
            --quiet

        gcloud projects add-iam-policy-binding $PROJECT_ID `
            --member="serviceAccount:vertex-ai-chore@$PROJECT_ID.iam.gserviceaccount.com" `
            --role="roles/aiplatform.user" `
            --quiet

        Write-Host "✅ Service account created!" -ForegroundColor Green
    } else {
        Write-Host "✅ Service account already exists!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Service account creation skipped (may already exist)" -ForegroundColor Yellow
}

# Set up frontend environment
Write-Host "📁 Setting up frontend environment..." -ForegroundColor Cyan
Set-Location frontend

if (!(Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    
    # Update .env.local with correct project ID
    (Get-Content ".env.local") -replace "evident-pattern-4h7j0", "compact-haiku-454409-j0" | Set-Content ".env.local"
    
    Write-Host "✅ Environment file created with project ID: $PROJECT_ID" -ForegroundColor Green
    Write-Host "⚠️  Please update .env.local with your Firebase configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ Environment file already exists!" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install --silent

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up Firebase project:" -ForegroundColor White
Write-Host "   → Go to: https://console.firebase.google.com" -ForegroundColor Yellow
Write-Host "   → Add project → Use existing Google Cloud project → $PROJECT_ID" -ForegroundColor Yellow
Write-Host "   → Enable Firestore Database (test mode)" -ForegroundColor Yellow
Write-Host "   → Add Web app and copy config to frontend/.env.local" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Test locally:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Deploy as NEW service to Cloud Run:" -ForegroundColor White
Write-Host "   .\deploy.ps1" -ForegroundColor Yellow
Write-Host "   ℹ️ 既存アプリケーションには影響しません" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Cyan
Write-Host "- Firebase Console: https://console.firebase.google.com" -ForegroundColor Blue
Write-Host "- Cloud Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host "- Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host "- Billing: https://console.cloud.google.com/billing?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host ""
Write-Host "🏆 Ready for hackathon! Good luck!" -ForegroundColor Green
