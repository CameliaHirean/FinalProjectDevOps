#!/bin/bash

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: health_check.sh <blue|green>"
  exit 1
fi

if [ "$ENVIRONMENT" != "blue" ] && [ "$ENVIRONMENT" != "green" ]; then
  echo "Invalid environment: $ENVIRONMENT"
  echo "Must be 'blue' or 'green'"
  exit 1
fi

PORT=$( [ "$ENVIRONMENT" = "blue" ] && echo "8001" || echo "8002" )
TARGET_URL="http://localhost:$PORT/health"

set -x

echo "[health-check] Starting verification for $ENVIRONMENT"
echo "[health-check] Target URL: $TARGET_URL"

# Check container is running
if ! docker ps --format '{{.Names}}' | grep -q "app-$ENVIRONMENT"; then
  echo "[health-check] Container app-$ENVIRONMENT is NOT running"
  docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true
  exit 1
fi

echo "[health-check] Container app-$ENVIRONMENT is running"

docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep "app-$ENVIRONMENT" || true

# Check HTTP health endpoint
STATUS=$(curl -s -o /tmp/health_body.txt -w "%{http_code}" "$TARGET_URL")
BODY=$(cat /tmp/health_body.txt 2>/dev/null || true)

echo "[health-check] HTTP status: $STATUS"
echo "[health-check] Response body: $BODY"

if [ "$STATUS" -ne 200 ]; then
  echo "[health-check] Health check FAILED for $ENVIRONMENT (HTTP $STATUS)"
  exit 1
fi

echo "[health-check] Health check PASSED for $ENVIRONMENT"
exit 0
