#!/bin/sh
# Usage: tools/shot.sh <url-path> <out.png> [width] [height]
# Takes a screenshot of a page from the local dev server with headless Chrome.
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
W=${3:-1280}; H=${4:-800}
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=$W,$H --virtual-time-budget=4000 --screenshot="$2" "http://localhost:8765/$1" 2>/dev/null
