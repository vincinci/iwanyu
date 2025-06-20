#!/bin/bash

# Launch Clean Chrome Browser for Development
# This creates a temporary Chrome profile without extensions

echo "🚀 Launching clean Chrome browser for development..."

# Create temporary directory for clean profile
TEMP_PROFILE_DIR="/tmp/chrome-dev-profile-$(date +%s)"
mkdir -p "$TEMP_PROFILE_DIR"

# Chrome flags for clean development environment
CHROME_FLAGS=(
  "--user-data-dir=$TEMP_PROFILE_DIR"
  "--disable-extensions"
  "--disable-plugins"
  "--disable-default-apps"
  "--disable-background-timer-throttling"
  "--disable-backgrounding-occluded-windows"
  "--disable-renderer-backgrounding"
  "--disable-features=TranslateUI"
  "--disable-web-security"
  "--disable-features=VizDisplayCompositor"
  "--no-first-run"
  "--no-default-browser-check"
  "--window-size=1920,1080"
)

# Try to find Chrome executable
if command -v google-chrome >/dev/null 2>&1; then
    CHROME_EXEC="google-chrome"
elif command -v google-chrome-stable >/dev/null 2>&1; then
    CHROME_EXEC="google-chrome-stable"
elif command -v chromium >/dev/null 2>&1; then
    CHROME_EXEC="chromium"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_EXEC="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [[ "$OSTYPE" == "msys" ]]; then
    CHROME_EXEC="chrome.exe"
else
    echo "❌ Chrome not found. Please install Google Chrome."
    exit 1
fi

# Launch Chrome with clean profile
echo "🌐 Opening http://localhost:5174 in clean browser..."
echo "📁 Temporary profile: $TEMP_PROFILE_DIR"
echo "🧹 No extensions, no cached data, clean console!"

"$CHROME_EXEC" "${CHROME_FLAGS[@]}" "http://localhost:5174" &

echo "✅ Clean browser launched!"
echo "💡 Tip: Bookmark this for extension-free development"
echo "🗑️  Profile will be deleted when you close the browser"

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up temporary profile..."
    rm -rf "$TEMP_PROFILE_DIR"
    echo "✅ Cleanup complete"
}

# Set trap to cleanup on script exit
trap cleanup EXIT 