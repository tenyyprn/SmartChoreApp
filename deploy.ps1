# Smart Chore App - Cloud Run Deployment Script (Windows PowerShell)
# This script builds and deploys the application to Google Cloud Run

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "compact-haiku-454409-j0"
$REGION = "us-central1"
$SERVICE_NAME = "smart-chore-app"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "🚀 Starting deployment to Google Cloud Run..." -ForegroundColor Green
Write-Host "Project: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "Service: $SERVICE_NAME (新規サービス)" -ForegroundColor Cyan
Write-Host "🛡️ 既存アプリケーションには影響しません" -ForegroundColor Yellow

# Check if gcloud is installed and authenticated
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "🔧 Setting up Google Cloud project..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Cyan
Write-Host "   ℹ️ 既存APIが有効な場合はスキップされます" -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable firestore.googleapis.com --quiet
gcloud services enable aiplatform.googleapis.com --quiet
gcloud services enable calendar-json.googleapis.com --quiet

# Build the Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

# Push the image to Google Container Registry
Write-Host "📤 Pushing image to Container Registry..." -ForegroundColor Cyan
docker push $IMAGE_NAME

# Deploy to Cloud Run as NEW service
Write-Host "🚀 Deploying NEW service to Cloud Run..." -ForegroundColor Cyan
Write-Host "   ℹ️ This will NOT affect existing applications" -ForegroundColor Green
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --max-instances 10 `
  --port 8080 `
  --set-env-vars "NODE_ENV=production" `
  --timeout 300

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Smart Chore App URL: $SERVICE_URL" -ForegroundColor Green
Write-Host "🛡️ Existing applications: UNAFFECTED" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up Firebase configuration for project: $PROJECT_ID" -ForegroundColor White
Write-Host "2. Configure Vertex AI credentials" -ForegroundColor White
Write-Host "3. Enable Google Calendar API" -ForegroundColor White
Write-Host "4. Update environment variables" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Cyan
Write-Host "- Cloud Run Console: https://console.cloud.google.com/run?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host "- Firebase Console: https://console.firebase.google.com" -ForegroundColor Blue
Write-Host "- Vertex AI Console: https://console.cloud.google.com/ai?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host "- New Service URL: $SERVICE_URL" -ForegroundColor Blue
