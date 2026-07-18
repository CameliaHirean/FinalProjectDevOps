#!/bin/bash

IMAGE_TAG=$1
ENVIRONMENT=$2  # "blue" or "green"

if [ -z "$IMAGE_TAG" ] || [ -z "$ENVIRONMENT" ]; then
  echo "Usage: deploy_to_idle.sh <image_tag> <blue|green>"
  exit 1
fi

# GHCR login (same as your working pipeline)
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

APP_DIR="/opt/$ENVIRONMENT"
PORT=$( [ "$ENVIRONMENT" = "blue" ] && echo "8001" || echo "8002" )

echo "Deploying image $IMAGE_TAG to $ENVIRONMENT on port $PORT"

docker pull ghcr.io/cameliahirean/medical-app:$IMAGE_TAG

docker stop app-$ENVIRONMENT || true
docker rm app-$ENVIRONMENT || true

docker run -d \
  --name app-$ENVIRONMENT \
  -p $PORT:$PORT \
  docker pull ghcr.io/cameliahirean/medical-app:$IMAGE_TAG

echo "Deployment to $ENVIRONMENT completed"
