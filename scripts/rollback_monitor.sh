#!/bin/bash

PUBLIC_URL=$1
NEW_ENV=$2

if [ -z "$PUBLIC_URL" ] || [ -z "$NEW_ENV" ]; then
  echo "Usage: rollback_monitor.sh <public_url> <blue|green>"
  exit 1
fi

OLD_ENV=$( [ "$NEW_ENV" = "blue" ] && echo "green" || echo "blue" )

echo "Monitoring $NEW_ENV for 10 minutes..."

for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PUBLIC_URL/health)

  if [ "$STATUS" -ne 200 ]; then
    echo "Health check failed. Rolling back to $OLD_ENV"
    ln -sf /etc/nginx/conf.d/$OLD_ENV.conf /etc/nginx/conf.d/active.conf
    systemctl reload nginx
    echo "$OLD_ENV" > /var/run/blue-green-state
    exit 1
  fi

  sleep 30
done

echo "New environment $NEW_ENV is healthy"
exit 0
