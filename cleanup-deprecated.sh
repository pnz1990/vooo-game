#!/bin/bash

# VOOO Game - Cleanup Deprecated Files
# This script removes unused/deprecated files from the codebase

echo "🧹 Starting codebase cleanup..."
echo "Removing deprecated and unused files..."

# Create backup first
echo "📦 Creating backup..."
git add .
git commit -m "Backup before cleanup - removing deprecated files"

# Remove deprecated modular JS files (keep explosion.js, tests.js, test-runner.js)
echo "🗑️  Removing deprecated JS modules..."
rm -f js/main.js
rm -f js/game.js  # Different from root game.js
rm -f js/config.js
rm -f js/assets.js
rm -f js/player.js
rm -f js/enemies.js
rm -f js/boss.js
rm -f js/levels.js
rm -f js/ui.js
rm -f js/input.js
rm -f js/effects.js
rm -f js/engine.js

# Remove unused stylesheet
echo "🎨 Removing unused stylesheet..."
rm -f style.css

# Remove system files
echo "🖥️  Removing system files..."
rm -f .DS_Store

# Add .DS_Store to .gitignore if not already there
echo "📝 Updating .gitignore..."
if ! grep -q ".DS_Store" .gitignore; then
    echo ".DS_Store" >> .gitignore
    echo "Added .DS_Store to .gitignore"
fi

# Verify cleanup
echo "✅ Cleanup completed!"
echo ""
echo "📊 Remaining files in js/ directory:"
ls -la js/
echo ""
echo "📋 Files removed:"
echo "  - js/main.js (ES6 entry point)"
echo "  - js/game.js (modular game class)"
echo "  - js/config.js (configuration constants)"
echo "  - js/assets.js (asset management)"
echo "  - js/player.js (player class)"
echo "  - js/enemies.js (enemy management)"
echo "  - js/boss.js (boss class)"
echo "  - js/levels.js (level management)"
echo "  - js/ui.js (UI management)"
echo "  - js/input.js (input handling)"
echo "  - js/effects.js (effects management)"
echo "  - js/engine.js (game engine)"
echo "  - style.css (unused stylesheet)"
echo "  - .DS_Store (system file)"
echo ""
echo "📋 Files kept:"
echo "  - js/explosion.js (actively used)"
echo "  - js/tests.js (test suite)"
echo "  - js/test-runner.js (test infrastructure)"
echo ""
echo "🧪 Running tests to verify everything still works..."
./run-tests.sh

if [ $? -eq 0 ]; then
    echo "✅ All tests passed! Cleanup successful."
    echo "🚀 Ready to commit cleaned codebase."
else
    echo "❌ Tests failed! Please check the cleanup."
    exit 1
fi
