#!/bin/bash

PUBLIC_URL=$1
NEW_ENV=$2

if [ -z "$PUBLIC_URL" ] || [ -z "$NEW_ENV" ]; then
  echo "Usage: rollback_monitor.sh <public_url> <blue|green>"
  exit 1
fi

OLD_ENV=$( [ "$NEW_ENV" = "blue" ] && echo "green" || echo "blue" )
TARGET_URL="$PUBLIC_URL/health"

set -x

echo "[rollback-monitor] Starting monitoring for $NEW_ENV"
echo "[rollback-monitor] Public URL: $PUBLIC_URL"
echo "[rollback-monitor] Health check target: $TARGET_URL"

echo "[rollback-monitor] Fallback environment: $OLD_ENV"

for i in {1..20}; do
  echo "[rollback-monitor] Attempt $i/20"
  STATUS=$(curl -s -o /tmp/rollback_body.txt -w "%{http_code}" "$TARGET_URL")
  BODY=$(cat /tmp/rollback_body.txt 2>/dev/null || true)

  echo "[rollback-monitor] HTTP status: $STATUS"
  echo "[rollback-monitor] Response body: $BODY"

  if [ "$STATUS" -ne 200 ]; then
    echo "[rollback-monitor] Health check failed. Rolling back to $OLD_ENV"

    # Switch NGINX upstream
    echo "[rollback-monitor] Switching nginx upstream to $OLD_ENV"
    sudo ln -sf /etc/nginx/upstreams/$OLD_ENV.conf /etc/nginx/conf.d/active.conf

    # Reload NGINX
    echo "[rollback-monitor] Reloading nginx"
    sudo systemctl reload nginx

    # Update state file
    echo "$OLD_ENV" | sudo tee /var/run/blue-green-state > /dev/null

    echo "[rollback-monitor] Rollback to $OLD_ENV completed"
    exit 1
  fi

  sleep 30
done

echo "[rollback-monitor] New environment $NEW_ENV is healthy"
exit 0
