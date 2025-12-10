#!/bin/sh
# This script will be run when the environment is initialized.
# Add any setup logic here.

echo "Setting up environment…"

# Install the required packages and suppress errors and warnings
yarn install --frozen-lockfile >/dev/null 2>&1

# Check if npm install succeeded
if [ $? -eq 0 ]; then
  echo "Packages installation succeeded."
else
  echo "Packages installation failed."
fi

# Create file to confirm setup complete
touch /tmp/.setup_finished

echo "Setup complete."
