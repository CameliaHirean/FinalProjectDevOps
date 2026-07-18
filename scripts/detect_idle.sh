#!/bin/bash

STATE_FILE="/var/run/blue-green-state"

if [ ! -f "$STATE_FILE" ]; then
  echo "blue" > "$STATE_FILE"
fi

ACTIVE=$(cat "$STATE_FILE")

if [ "$ACTIVE" = "blue" ]; then
  echo "green"
else
  echo "blue"
fi
