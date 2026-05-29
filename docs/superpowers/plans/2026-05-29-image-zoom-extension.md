# Image Zoom Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small Manifest V3 Chrome extension that lets the user zoom useful images on any website with hover wheel zoom and click overlay zoom.

**Architecture:** The extension uses one content script and one stylesheet injected into normal web pages. The content script handles image detection, inline zoom, overlay zoom, wheel input, drag panning, Escape close, and background click close. There is no popup, service worker, storage, or custom icon in the first version.

**Tech Stack:** Chrome Manifest V3, plain JavaScript, CSS, local manual HTML test page.

---

## Notes From Current Context

- The project folder is `/Users/cheonfongliew/Code/projects/ImageZoom`.
- The folder is not a git repository, so commit steps are not runnable unless git is initialized later.
- The approved spec is `docs/superpowers/specs/2026-05-29-image-zoom-extension-design.md`.
- Modern web guidance was checked. The closest guide covered overlay dismissal with Escape and backdrop click. For this extension, use a fixed overlay instead of the Popover API because content scripts run inside arbitrary pages and need simple, isolated styling.

## File Structure

- Create `manifest.json`
  - Defines the extension and injects the script and stylesheet.
- Create `styles.css`
  - Owns all extension visual behavior with `iz-` prefixed classes.
- Create `content.js`
  - Owns target image detection, hover state, inline wheel zoom, overlay zoom, drag panning, and cleanup.
- Create `tests/manual.html`
  - Gives a local page for manual testing without needing external images.
- Create `README.md`
  - Explains loading the unpacked extension and using it.

## Task 1: Add Manifest And Styles

**Files:**
- Create: `manifest.json`
- Create: `styles.css`

- [ ] **Step 1: Create the Manifest V3 file**

Create `manifest.json` with this content:

```json
{
  "manifest_version": 3,
  "name": "Image Zoom",
  "version": "0.1.0",
  "description": "Zoom images on web pages with hover wheel zoom and click overlay zoom.",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_idle"
    }
  ]
}
```

- [ ] **Step 2: Create the stylesheet**

Create `styles.css` with this content:

```css
.iz-zoom-target {
  cursor: zoom-in !important;
}

.iz-inline-zoomed {
  position: relative !important;
  z-index: 2147483000 !important;
  transition: transform 120ms ease !important;
  will-change: transform !important;
}

.iz-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(0, 0, 0, 0.88) !important;
  cursor: zoom-out !important;
}

.iz-overlay-image {
  max-width: 92vw !important;
  max-height: 92vh !important;
  object-fit: contain !important;
  transform-origin: center center !important;
  transition: transform 80ms ease !important;
  cursor: grab !important;
  user-select: none !important;
  -webkit-user-drag: none !important;
  will-change: transform !important;
}

.iz-overlay-image.iz-dragging {
  cursor: grabbing !important;
  transition: none !important;
}
```

- [ ] **Step 3: Validate manifest JSON**

Run:

```bash
python3 -m json.tool manifest.json
```

Expected: the command prints formatted JSON and exits with code `0`.

## Task 2: Add Image Zoom Content Script

**Files:**
- Create: `content.js`

- [ ] **Step 1: Create the content script**

Create `content.js` with this content:

```js
(() => {
  'use strict';

  const MIN_IMAGE_SIZE = 80;
  const INLINE_MIN_ZOOM = 1;
  const INLINE_MAX_ZOOM = 5;
  const OVERLAY_MIN_ZOOM = 1;
  const OVERLAY_MAX_ZOOM = 8;
  const ZOOM_STEP = 0.25;

  const inlineZoom = new WeakMap();
  let overlayState = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function roundZoom(value) {
    return Math.round(value * 100) / 100;
  }

  function getImageSource(image) {
    return image.currentSrc || image.src || '';
  }

  function isUsefulImage(target) {
    if (!(target instanceof HTMLImageElement)) return false;
    if (!getImageSource(target)) return false;

    const rect = target.getBoundingClientRect();
    const renderedWidth = rect.width;
    const renderedHeight = rect.height;
    const naturalWidth = target.naturalWidth || renderedWidth;
    const naturalHeight = target.naturalHeight || renderedHeight;

    return (
      renderedWidth >= MIN_IMAGE_SIZE &&
      renderedHeight >= MIN_IMAGE_SIZE &&
      naturalWidth >= MIN_IMAGE_SIZE &&
      naturalHeight >= MIN_IMAGE_SIZE
    );
  }

  function getInlineZoom(image) {
    return inlineZoom.get(image) || INLINE_MIN_ZOOM;
  }

  function setInlineZoom(image, zoom, originX, originY) {
    const nextZoom = roundZoom(clamp(zoom, INLINE_MIN_ZOOM, INLINE_MAX_ZOOM));

    if (nextZoom <= INLINE_MIN_ZOOM) {
      inlineZoom.delete(image);
      image.classList.remove('iz-inline-zoomed');
      image.style.removeProperty('transform');
      image.style.removeProperty('transform-origin');
      return;
    }

    inlineZoom.set(image, nextZoom);
    image.classList.add('iz-inline-zoomed');
    image.style.transformOrigin = `${originX}% ${originY}%`;
    image.style.transform = `scale(${nextZoom})`;
  }

  function getPointerOrigin(event, image) {
    const rect = image.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100)
    };
  }

  function onPointerOver(event) {
    if (!isUsefulImage(event.target)) return;
    event.target.classList.add('iz-zoom-target');
  }

  function onPointerOut(event) {
    if (!(event.target instanceof HTMLImageElement)) return;
    event.target.classList.remove('iz-zoom-target');
  }

  function onWheel(event) {
    if (overlayState) return;
    if (!isUsefulImage(event.target)) return;

    event.preventDefault();

    const image = event.target;
    const direction = event.deltaY < 0 ? 1 : -1;
    const origin = getPointerOrigin(event, image);
    const nextZoom = getInlineZoom(image) + direction * ZOOM_STEP;

    setInlineZoom(image, nextZoom, origin.x, origin.y);
  }

  function openOverlay(image) {
    const source = getImageSource(image);
    if (!source || overlayState) return;

    const overlay = document.createElement('div');
    const overlayImage = document.createElement('img');

    overlay.className = 'iz-overlay';
    overlayImage.className = 'iz-overlay-image';
    overlayImage.src = source;
    overlayImage.alt = image.alt || '';
    overlayImage.decoding = 'async';
    overlayImage.draggable = false;

    overlay.append(overlayImage);
    document.documentElement.append(overlay);

    overlayState = {
      overlay,
      image: overlayImage,
      zoom: OVERLAY_MIN_ZOOM,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      dragging: false
    };

    updateOverlayTransform();
  }

  function closeOverlay() {
    if (!overlayState) return;

    overlayState.overlay.remove();
    overlayState = null;
  }

  function updateOverlayTransform() {
    if (!overlayState) return;

    overlayState.image.style.transform =
      `translate(${overlayState.x}px, ${overlayState.y}px) scale(${overlayState.zoom})`;
  }

  function onOverlayWheel(event) {
    if (!overlayState) return;
    if (!overlayState.overlay.contains(event.target)) return;

    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    overlayState.zoom = roundZoom(
      clamp(
        overlayState.zoom + direction * ZOOM_STEP,
        OVERLAY_MIN_ZOOM,
        OVERLAY_MAX_ZOOM
      )
    );

    if (overlayState.zoom === OVERLAY_MIN_ZOOM) {
      overlayState.x = 0;
      overlayState.y = 0;
    }

    updateOverlayTransform();
  }

  function onOverlayPointerDown(event) {
    if (!overlayState || event.target !== overlayState.image) return;

    event.preventDefault();

    overlayState.dragging = true;
    overlayState.startX = event.clientX;
    overlayState.startY = event.clientY;
    overlayState.startOffsetX = overlayState.x;
    overlayState.startOffsetY = overlayState.y;
    overlayState.image.classList.add('iz-dragging');
    overlayState.image.setPointerCapture(event.pointerId);
  }

  function onOverlayPointerMove(event) {
    if (!overlayState || !overlayState.dragging) return;

    overlayState.x = overlayState.startOffsetX + event.clientX - overlayState.startX;
    overlayState.y = overlayState.startOffsetY + event.clientY - overlayState.startY;
    updateOverlayTransform();
  }

  function stopOverlayDrag() {
    if (!overlayState) return;

    overlayState.dragging = false;
    overlayState.image.classList.remove('iz-dragging');
  }

  function onClick(event) {
    if (overlayState) {
      if (event.target === overlayState.overlay) closeOverlay();
      return;
    }

    if (!isUsefulImage(event.target)) return;

    event.preventDefault();
    event.stopPropagation();
    openOverlay(event.target);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') closeOverlay();
  }

  document.addEventListener('pointerover', onPointerOver, true);
  document.addEventListener('pointerout', onPointerOut, true);
  document.addEventListener('wheel', onWheel, { capture: true, passive: false });
  document.addEventListener('wheel', onOverlayWheel, { capture: true, passive: false });
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('pointerdown', onOverlayPointerDown, true);
  document.addEventListener('pointermove', onOverlayPointerMove, true);
  document.addEventListener('pointerup', stopOverlayDrag, true);
  document.addEventListener('pointercancel', stopOverlayDrag, true);
})();
```

- [ ] **Step 2: Check JavaScript syntax**

Run:

```bash
node --check content.js
```

Expected: no output and exit code `0`.

## Task 3: Add Manual Test Page

**Files:**
- Create: `tests/manual.html`

- [ ] **Step 1: Create the test page**

Create `tests/manual.html` with this content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Image Zoom Manual Test</title>
    <link rel="stylesheet" href="../styles.css">
    <style>
      body {
        margin: 0;
        font-family: system-ui, sans-serif;
        line-height: 1.5;
        color: #1f2933;
        background: #f6f7f9;
      }

      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 20px 80px;
      }

      h1 {
        margin: 0 0 20px;
        font-size: 28px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 20px;
      }

      figure {
        margin: 0;
        padding: 16px;
        background: #fff;
        border: 1px solid #d8dde6;
      }

      img {
        display: block;
        max-width: 100%;
        height: auto;
      }

      .tiny {
        width: 48px;
        height: 48px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Image Zoom Manual Test</h1>
      <div class="grid">
        <figure>
          <img alt="Large landscape test image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='540' viewBox='0 0 900 540'%3E%3Crect width='900' height='540' fill='%23dbeafe'/%3E%3Ccircle cx='240' cy='210' r='120' fill='%23f97316'/%3E%3Crect x='430' y='120' width='310' height='250' fill='%230f766e'/%3E%3Ctext x='450' y='430' font-family='Arial' font-size='54' fill='%23111827'%3ELandscape%3C/text%3E%3C/svg%3E">
          <figcaption>Large image: hover, wheel, and click should work.</figcaption>
        </figure>

        <figure>
          <img alt="Tall portrait test image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='860' viewBox='0 0 420 860'%3E%3Crect width='420' height='860' fill='%23ecfccb'/%3E%3Crect x='70' y='90' width='280' height='680' fill='%238b5cf6'/%3E%3Ccircle cx='210' cy='300' r='90' fill='%23facc15'/%3E%3Ctext x='90' y='810' font-family='Arial' font-size='42' fill='%23111827'%3EPortrait%3C/text%3E%3C/svg%3E">
          <figcaption>Tall image: overlay should fit inside the screen.</figcaption>
        </figure>

        <figure>
          <img alt="Wide banner test image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='360' viewBox='0 0 1200 360'%3E%3Crect width='1200' height='360' fill='%23fee2e2'/%3E%3Cpath d='M0 260 C220 80 360 420 590 210 C780 40 940 320 1200 120 L1200 360 L0 360 Z' fill='%230ea5e9'/%3E%3Ctext x='430' y='190' font-family='Arial' font-size='58' fill='%23111827'%3EWide image%3C/text%3E%3C/svg%3E">
          <figcaption>Wide image: zoom and overlay should work.</figcaption>
        </figure>

        <figure>
          <img class="tiny" alt="Small icon test image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%231f2937'/%3E%3Ccircle cx='24' cy='24' r='12' fill='%23fff'/%3E%3C/svg%3E">
          <figcaption>Small icon: zoom cursor and click overlay should not activate.</figcaption>
        </figure>
      </div>
    </main>
    <script src="../content.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify the test page references local files**

Run:

```bash
rg -n "styles.css|content.js|data:image/svg" tests/manual.html
```

Expected: output includes `../styles.css`, `../content.js`, and four `data:image/svg` image sources.

## Task 4: Add Short Usage Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create the README**

Create `README.md` with this content:

```markdown
# Image Zoom

Image Zoom is a small Chrome extension for zooming images on web pages.

## Use

- Hover over a useful image to show the zoom cursor.
- Scroll the mouse wheel while hovering the image to zoom inline.
- Click the image to open the full-page zoom overlay.
- In the overlay, scroll to zoom and drag to pan.
- Press Escape or click the dark background to close the overlay.

Tiny images under 80px wide or 80px tall are ignored.

## Install In Chrome

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Choose this folder: `/Users/cheonfongliew/Code/projects/ImageZoom`.

## Local Test Page

Open `tests/manual.html` in a browser. The test page loads the same script and styles directly, so it can be tested before loading the extension.
```

- [ ] **Step 2: Check docs mention install and controls**

Run:

```bash
rg -n "Load unpacked|Scroll|Escape|80px" README.md
```

Expected: output includes the install instruction and the main controls.

## Task 5: Final Verification

**Files:**
- Read: `manifest.json`
- Read: `content.js`
- Read: `styles.css`
- Read: `tests/manual.html`
- Read: `README.md`

- [ ] **Step 1: Run syntax checks**

Run:

```bash
python3 -m json.tool manifest.json
node --check content.js
```

Expected:

- `python3 -m json.tool manifest.json` prints formatted JSON and exits with code `0`.
- `node --check content.js` prints nothing and exits with code `0`.

- [ ] **Step 2: Check there are no missing icon references**

Run:

```bash
rg -n "\"icons\"|\"default_icon\"" manifest.json
```

Expected: no output. Exit code `1` is acceptable because the manifest should not reference icon files.

- [ ] **Step 3: Check extension files are present**

Run:

```bash
rg --files
```

Expected: output includes:

```text
README.md
content.js
docs/superpowers/plans/2026-05-29-image-zoom-extension.md
docs/superpowers/specs/2026-05-29-image-zoom-extension-design.md
manifest.json
styles.css
tests/manual.html
```

- [ ] **Step 4: Check git availability**

Run:

```bash
git rev-parse --is-inside-work-tree
```

Expected in the current project: failure with `fatal: not a git repository`. Do not commit in this project unless the user asks to initialize git.

- [ ] **Step 5: Manual behavior check**

Open `tests/manual.html` in a browser and check:

- large image hover shows zoom cursor
- large image wheel zooms inline
- small icon does not show zoom cursor
- image click opens overlay
- overlay wheel zoom works
- overlay drag moves the image
- Escape closes overlay
- background click closes overlay
