#!/bin/bash

cd /usercode/FILESYSTEM

# Check if setup is complete
if [ ! -f "/tmp/.setup_finished" ]; then
    echo "The setup is not finished yet. Try again in a few seconds." >&2
    exit 1
fi

# Suppress npm update notifications
export NPM_CONFIG_UPDATE_NOTIFIER=false

# Run TypeScript directly with tsx
cd src
NODE_NO_WARNINGS=1 npx tsx main.ts