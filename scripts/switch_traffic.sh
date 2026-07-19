#!/bin/bash

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "blue" ] && [ "$ENVIRONMENT" != "green" ]; then
  echo "Usage: switch_traffic.sh <blue|green>"
  exit 1
fi

# Switch NGINX upstream
sudo ln -sf /etc/nginx/upstreams/$ENVIRONMENT.conf /etc/nginx/conf.d/active.conf

# Reload NGINX
sudo systemctl reload nginx

# Update state file
echo "$ENVIRONMENT" | sudo tee /var/run/blue-green-state > /dev/null

echo "Traffic switched to $ENVIRONMENT"
