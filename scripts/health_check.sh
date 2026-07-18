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

echo "Running health check on $ENVIRONMENT (port $PORT)"

# Check container is running
if ! docker ps --format '{{.Names}}' | grep -q "app-$ENVIRONMENT"; then
  echo "Container app-$ENVIRONMENT is NOT running"
  exit 1
fi

# Check HTTP health endpoint
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health)

if [ "$STATUS" -ne 200 ]; then
  echo "Health check FAILED for $ENVIRONMENT (HTTP $STATUS)"
  exit 1
fi

echo "Health check PASSED for $ENVIRONMENT"
exit 0
