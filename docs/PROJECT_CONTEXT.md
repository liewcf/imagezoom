# Project Context

## Overview

- Project purpose: Image Zoom is a small Chrome extension for zooming images on web pages.
- Primary users: The owner using Chrome with the extension loaded unpacked for personal browsing.
- Current status: Version `0.1.0` is implemented on `main`, locally verified, and prepared for Chrome Web Store submission. It has not yet been verified by loading the unpacked extension through `chrome://extensions`.

## Architecture

- Manifest V3 extension defined in `manifest.json`.
- Content-script-only design: `content.js` and `styles.css` are injected on `http://*/*` and `https://*/*` at `document_idle`.
- No popup, service worker, storage, `tabs` permission, `scripting` permission, or extension action in version `0.1.0`.
- Chrome Web Store icons are real PNG files in `icons/` at 16px, 48px, and 128px.
- `content.js` targets normal `HTMLImageElement` images only.
- Images are ignored unless rendered width/height and natural width/height are all at least `80px`.
- Hover adds the `iz-zoom-target` class. Wheel zooms inline from `1x` to `5x`.
- Clicking a useful image opens a fixed overlay. If the image has `srcset`, the overlay uses the largest existing candidate. Overlay wheel zooms from `1x` to `8x`; dragging pans; Escape or background click closes it.
- Overlay and overlay-image styles are applied inline by `content.js` to extension-created elements. `styles.css` must not contain global `.iz-overlay` selectors, so page-owned DOM with matching class names cannot inherit the full-screen overlay styling.
- Wheel handlers do not call `preventDefault()` when `deltaY === 0` or when zoom is already at its min/max bound.

## Development Workflow

- Package manager: None.
- Version control: Git is initialized. Verify current branch and commit state with `git status --short --branch`.
- Build command: None.
- Chrome Web Store package command: `scripts/package-extension.sh`, which creates `dist/image-zoom-v0.1.0.zip`.
- Test command: `node --test`.
- Syntax checks: `node --check content.js` and `python3 -m json.tool manifest.json`.
- Manual test page: `tests/manual.html`.
- Local browser test option: serve the project root with `python3 -m http.server 8765`, then open `http://127.0.0.1:8765/tests/manual.html`.
- Chrome install path: open `chrome://extensions`, enable Developer mode, click Load unpacked, and choose `/Users/cheonfongliew/Code/projects/ImageZoom`.

## Constraints

- Do not assume framework, deployment, package manager, or infrastructure details until verified from repo evidence.
- The Chrome Web Store package should contain only `manifest.json`, `content.js`, `styles.css`, and `icons/`.
- Do not add icon references unless real icon files exist at the declared sizes.
- Store listing notes live in `CHROMEWEBSTORE.md`; the privacy policy text to host lives in `PRIVACY.md`.
- Keep project memory free of secrets, credentials, private tokens, and personal browsing data.
