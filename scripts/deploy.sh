#!/bin/bash

# Deployment script for Newhill Spices Platform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    print_error "Please provide environment (staging or production)"
    exit 1
fi

ENVIRONMENT=$1
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}

if [ -z "$AWS_ACCOUNT_ID" ]; then
    print_error "AWS_ACCOUNT_ID environment variable is required"
    exit 1
fi

print_status "Starting deployment for $ENVIRONMENT environment"

# Build and push Docker images
print_status "Building and pushing Docker images..."

# Login to ECR
print_status "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repositories if they don't exist
REPOSITORIES=("newhill-spices-web" "newhill-spices-api" "newhill-spices-worker")

for repo in "${REPOSITORIES[@]}"; do
    print_status "Creating ECR repository: $repo"
    aws ecr describe-repositories --repository-names $repo --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $repo --region $AWS_REGION
done

# Build and push web image
print_status "Building and pushing web image..."
docker build -t newhill-spices-web:latest ./apps/web
docker tag newhill-spices-web:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/newhill-spices-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/newhill-spices-web:latest

# Build and push API image
print_status "Building and pushing API image..."
docker build -t newhill-spices-api:latest ./apps/api
docker tag newhill-spices-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/newhill-spices-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/newhill-spices-api:latest

# Build and push worker image
print_status "Building and pushing worker image..."
docker build -t newhill-spices-worker:latest ./apps/worker
docker tag newhill-spices-worker:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/newhill-spices-worker:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/newhill-spices-worker:latest

# Deploy infrastructure
print_status "Deploying infrastructure..."
cd infrastructure
npm ci
npm run deploy:$ENVIRONMENT

# Update ECS services
print_status "Updating ECS services..."
aws ecs update-service --cluster newhill-spices-cluster --service newhill-spices-web --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster newhill-spices-cluster --service newhill-spices-api --force-new-deployment --region $AWS_REGION

# Invalidate CloudFront cache
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*" --region $AWS_REGION
fi

print_status "Deployment completed successfully for $ENVIRONMENT environment"
