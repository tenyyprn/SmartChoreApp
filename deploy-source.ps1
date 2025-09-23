# Smart Chore App - Source-based Cloud Run Deployment (Windows PowerShell)
# This script deploys directly from source code without Docker

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "compact-haiku-454409-j0"
$REGION = "us-central1"
$SERVICE_NAME = "smart-chore-app"

Write-Host "🚀 Starting SOURCE-BASED deployment to Cloud Run..." -ForegroundColor Green
Write-Host "Project: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "Service: $SERVICE_NAME (新規サービス)" -ForegroundColor Cyan
Write-Host "📦 No Docker required!" -ForegroundColor Yellow
Write-Host "🛡️ 既存アプリケーションには影響しません" -ForegroundColor Yellow

# Check if gcloud is installed and authenticated
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "🔧 Setting up Google Cloud project..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "🔧 Enabling Cloud Build API..." -ForegroundColor Cyan
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet

# Deploy from source code directly
Write-Host "🚀 Deploying from source code..." -ForegroundColor Cyan
Write-Host "   ℹ️ Cloud Build will handle the containerization" -ForegroundColor Yellow

gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --max-instances 10 `
  --port 8080 `
  --set-env-vars "NODE_ENV=production" `
  --timeout 300 `
  --project $PROJECT_ID

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID

Write-Host ""
Write-Host "✅ Source-based deployment completed!" -ForegroundColor Green
Write-Host "🌐 Smart Chore App URL: $SERVICE_URL" -ForegroundColor Green
Write-Host "🛡️ Existing applications: UNAFFECTED" -ForegroundColor Green
Write-Host "📦 No Docker required!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test the deployed app: $SERVICE_URL" -ForegroundColor White
Write-Host "2. Set up Firebase configuration" -ForegroundColor White
Write-Host "3. Configure environment variables" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Cyan
Write-Host "- Deployed App: $SERVICE_URL" -ForegroundColor Blue
Write-Host "- Cloud Run Console: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host "- Cloud Build: https://console.cloud.google.com/cloud-build?project=$PROJECT_ID" -ForegroundColor Blue
