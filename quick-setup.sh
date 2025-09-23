#!/bin/bash

# Smart Chore App - One-click Setup for evident-pattern-4h7j0
# This script sets up everything needed for the hackathon

set -e

PROJECT_ID="evident-pattern-4h7j0"
REGION="us-central1"

echo "🚀 Smart Chore App - Hackathon Setup for ${PROJECT_ID}"
echo "==============================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    echo "   Download: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    echo "   Download: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm is not installed. Please install it first."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

echo "✅ All prerequisites met!"

# Set up gcloud project
echo "🔧 Setting up Google Cloud project..."
gcloud config set project $PROJECT_ID

# Enable all required APIs
echo "🔧 Enabling required APIs..."
echo "   This may take 2-3 minutes..."

gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable firestore.googleapis.com --quiet
gcloud services enable aiplatform.googleapis.com --quiet
gcloud services enable calendar-json.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

echo "✅ APIs enabled successfully!"

# Set up Docker authentication
echo "🔧 Setting up Docker authentication..."
gcloud auth configure-docker --quiet

# Create service account for Vertex AI
echo "🤖 Creating Vertex AI service account..."
if ! gcloud iam service-accounts describe vertex-ai-chore@${PROJECT_ID}.iam.gserviceaccount.com &> /dev/null; then
    gcloud iam service-accounts create vertex-ai-chore \
        --display-name="Vertex AI for Chore App" \
        --project=$PROJECT_ID \
        --quiet

    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:vertex-ai-chore@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/aiplatform.user" \
        --quiet

    echo "✅ Service account created!"
else
    echo "✅ Service account already exists!"
fi

# Set up frontend environment
echo "📁 Setting up frontend environment..."
cd frontend

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Environment file created!"
    echo "⚠️  Please update .env.local with your Firebase configuration"
else
    echo "✅ Environment file already exists!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up Firebase project:"
echo "   → Go to: https://console.firebase.google.com"
echo "   → Add project → Use existing Google Cloud project → ${PROJECT_ID}"
echo "   → Enable Firestore Database (test mode)"
echo "   → Add Web app and copy config to frontend/.env.local"
echo ""
echo "2. Test locally:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Deploy to Cloud Run:"
echo "   ./deploy.sh"
echo ""
echo "🔗 Useful links:"
echo "- Firebase Console: https://console.firebase.google.com"
echo "- Cloud Console: https://console.cloud.google.com/home/dashboard?project=${PROJECT_ID}"
echo "- Cloud Run: https://console.cloud.google.com/run?project=${PROJECT_ID}"
echo ""
echo "🏆 Ready for hackathon! Good luck!"
