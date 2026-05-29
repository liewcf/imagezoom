# Image Zoom

Image Zoom is a small Chrome extension for zooming images on web pages.

## Use

- Hover over a useful image to show the zoom cursor.
- Scroll the mouse wheel while hovering the image to zoom inline.
- Click the image to open the full-page zoom overlay.
- In the overlay, scroll to zoom and drag to pan.
- Press Escape or click the dark background to close the overlay.

When an image has a larger `srcset` option, the overlay uses that larger image on demand.

Tiny images under 80px wide or 80px tall are ignored.

## Install In Chrome

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Choose this folder: `/Users/cheonfongliew/Code/projects/ImageZoom`.

Note: This extension runs on all web pages. Only load it from this trusted local folder for personal use.

## Local Test Page

Open `tests/manual.html` in a browser. The test page loads the same script and styles directly, so it can be tested before loading the extension.
