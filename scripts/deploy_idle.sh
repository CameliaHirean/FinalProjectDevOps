#!/bin/bash

IDLE_ENV=$1
IMAGE_TAG=$2

if [ "$IDLE_ENV" != "blue" ] && [ "$IDLE_ENV" != "green" ]; then
  echo "Usage: deploy_idle.sh <blue|green> <image_tag>"
  exit 1
fi

# GHCR login
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

PORT=$( [ "$IDLE_ENV" = "blue" ] && echo "8001" || echo "8002" )

echo "Deploying image $IMAGE_TAG to $IDLE_ENV on port $PORT"

# Pull image
docker pull ghcr.io/cameliahirean/medical-app:$IMAGE_TAG

# Stop only the idle environment container
docker stop app-$IDLE_ENV || true
docker rm app-$IDLE_ENV || true

# Run new version ONLY on idle environment
docker run -d \
  --name app-$IDLE_ENV \
  -e PORT=3000 \
  -p $PORT:3000 \
  ghcr.io/cameliahirean/medical-app:$IMAGE_TAG

echo "Deployment to $IDLE_ENV completed"
