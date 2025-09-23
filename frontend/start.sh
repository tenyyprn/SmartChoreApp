#!/bin/bash

# Build the React app
npm run build

# Serve the built app on port 8080
npx serve -s dist -l ${PORT:-8080} -n
