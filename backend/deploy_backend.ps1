# Deploy backend to Google Cloud Run

# Check if gcloud is installed
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Error "Google Cloud CLI (gcloud) is not installed or not in PATH."
    Write-Host "Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Ask for Project ID
$projectId = Read-Host "Enter your Google Cloud Project ID"
if (-not $projectId) {
    Write-Error "Project ID is required."
    exit 1
}

# Set project
Write-Host "Setting project to $projectId..."
gcloud config set project $projectId

# Ask for Region
$region = Read-Host "Enter region (default: asia-southeast1)"
if (-not $region) {
    $region = "asia-southeast1"
}

# Enable APIs
Write-Host "Enabling Cloud Build and Cloud Run APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Submit build using cloudbuild.yaml (to enable BuildKit if needed, or just standard build)
Write-Host "Submitting build to Cloud Build..."
$serviceName = "stacknodes-backend"
$imageName = "gcr.io/$projectId/$serviceName"
gcloud builds submit --tag $imageName

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    exit $LASTEXITCODE
}

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $serviceName `
    --image $imageName `
    --platform managed `
    --region $region `
    --allow-unauthenticated `
    --port 8080


if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!"
    Write-Host "Service URL:"
    gcloud run services describe $serviceName --platform managed --region $region --format 'value(status.url)'
} else {
    Write-Error "Deployment failed."
}
