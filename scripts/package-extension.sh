#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

VERSION=$(node -p "require('./manifest.json').version")
OUTPUT="dist/image-zoom-v${VERSION}.zip"
TEMP_ZIP="dist/.image-zoom-v${VERSION}.zip.tmp"

mkdir -p dist
rm -f "$TEMP_ZIP"

zip -q -r "$TEMP_ZIP" \
  manifest.json \
  content.js \
  styles.css \
  icons \
  -x "*.DS_Store" \
  -x "*/.DS_Store"

mv "$TEMP_ZIP" "$OUTPUT"

echo "$OUTPUT"
