#!/bin/bash

# Smart Chore App - Cloud Run Deployment Script
# This script builds and deploys the application to Google Cloud Run

set -e

# Configuration
PROJECT_ID="compact-haiku-454409-j0"
REGION="${REGION:-us-central1}"
SERVICE_NAME="smart-chore-app"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting deployment to Google Cloud Run..."
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Service: ${SERVICE_NAME} (新規サービス)"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Set the project
echo "🔧 Setting up Google Cloud project..."
gcloud config set project $PROJECT_ID

# Enable required APIs (if not already enabled)
echo "🔧 Enabling required APIs..."
echo "   Checking API status..."
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable firestore.googleapis.com --quiet
gcloud services enable aiplatform.googleapis.com --quiet
gcloud services enable calendar-json.googleapis.com --quiet

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Push the image to Google Container Registry
echo "📤 Pushing image to Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run as NEW service
echo "🚀 Deploying NEW service to Cloud Run..."
echo "   ℹ️ This will NOT affect existing applications"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars "NODE_ENV=production" \
  --timeout 300

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Smart Chore App URL: $SERVICE_URL"
echo "🛡️ Existing applications: UNAFFECTED"
echo ""
echo "📋 Next steps:"
echo "1. Set up Firebase configuration for project: ${PROJECT_ID}"
echo "2. Configure Vertex AI credentials"
echo "3. Enable Google Calendar API"
echo "4. Update environment variables"
echo ""
echo "🔗 Useful links:"
echo "- Cloud Run Console: https://console.cloud.google.com/run?project=${PROJECT_ID}"
echo "- Firebase Console: https://console.firebase.google.com"
echo "- Vertex AI Console: https://console.cloud.google.com/ai?project=${PROJECT_ID}"
echo "- New Service URL: $SERVICE_URL"
