#!/bin/bash

# Navigate to project directory
cd /opt/illustrarama/illustrarama-core || {
  echo "Failed to cd into /opt/illustrarama/illustrarama-core"
  exit 1
}

# Install dependencies
echo "Installing dependencies..."
npm install || {
  echo "npm install failed"
  exit 1
}

# Restart the application with PM2
echo "Restarting the application with PM2..."
pm2 restart illustrarama-core || {
  echo "PM2 restart failed"
  exit 1
}

echo "Backend Deployment complete."
