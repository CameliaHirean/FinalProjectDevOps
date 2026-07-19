#!/bin/bash

IMAGE_TAG=$1
ENVIRONMENT=$2  # "blue" or "green"

if [ -z "$IMAGE_TAG" ] || [ -z "$ENVIRONMENT" ]; then
  echo "Usage: deploy_to_idle.sh <image_tag> <blue|green>"
  exit 1
fi

# GHCR login
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

PORT=$( [ "$ENVIRONMENT" = "blue" ] && echo "8001" || echo "8002" )

echo "Deploying image $IMAGE_TAG to $ENVIRONMENT on port $PORT"

# Pull image
docker pull ghcr.io/cameliahirean/medical-app:$IMAGE_TAG || {
  echo "Image pull failed!"
  exit 1
}

# Stop old container
docker stop app-$ENVIRONMENT || true
docker rm app-$ENVIRONMENT || true

# Run new container
docker run -d \
  --name app-$ENVIRONMENT \
  -p $PORT:3000 \
  ghcr.io/cameliahirean/medical-app:$IMAGE_TAG || {
    echo "Container failed to start!"
    exit 1
}

echo "Deployment to $ENVIRONMENT completed"
