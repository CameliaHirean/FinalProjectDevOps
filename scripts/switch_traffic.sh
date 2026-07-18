#!/bin/bash

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "blue" ] && [ "$ENVIRONMENT" != "green" ]; then
  echo "Usage: switch_traffic.sh <blue|green>"
  exit 1
fi

ln -sf /etc/nginx/conf.d/$ENVIRONMENT.conf /etc/nginx/conf.d/active.conf

systemctl reload nginx

echo "$ENVIRONMENT" > /var/run/blue-green-state

echo "Traffic switched to $ENVIRONMENT"
