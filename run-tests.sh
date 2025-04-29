#!/bin/bash

# Run tests before pushing changes
# This script can be run manually or automatically via git hooks

echo "Running VOOO Game tests..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run tests."
    exit 1
fi

# Run the tests
node js/test-runner.js

# Check the exit code
if [ $? -eq 0 ]; then
    echo "All tests passed! You can safely push your changes."
    exit 0
else
    echo "Tests failed! Please fix the issues before pushing."
    exit 1
fi
