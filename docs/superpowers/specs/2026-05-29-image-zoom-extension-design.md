# Image Zoom Chrome Extension Design

## Goal

Create a small Chrome extension that lets the user zoom images on any website.

## Success Criteria

- Hovering over a useful image shows a zoom cursor.
- Scrolling the mouse wheel while hovering an image zooms it in or out.
- Clicking an image opens a zoom overlay.
- In the overlay, the user can zoom with the wheel and drag to pan.
- Pressing Escape or clicking the dark background closes the overlay.
- Tiny icons and tracking pixels are ignored.
- The extension works as an unpacked Manifest V3 extension in Chrome.

## Approach

Use a Manifest V3 content-script extension.

The first version will not have a popup, settings page, service worker, or custom icons. Chrome can use its default extension icon. This keeps the extension simple and avoids unused permissions.

## Files

- `manifest.json`
  - Defines the extension.
  - Injects `content.js` and `styles.css` into normal web pages.
- `content.js`
  - Detects image hover.
  - Handles wheel zoom on images.
  - Opens and controls the zoom overlay.
- `styles.css`
  - Adds cursor, overlay, and zoom styling.

## Permissions

Use `content_scripts` with host match `<all_urls>`.

No `tabs`, `scripting`, storage, or service-worker permission is needed for the first version because the extension does not read tab data, inject scripts manually, or save settings.

## Image Detection

The extension will target normal `img` elements.

It will ignore images that are too small, such as:

- width under `80px`
- height under `80px`

This avoids most icons, avatars, sprites, and tracking pixels.

## Inline Hover Zoom

When the mouse is over an image:

- The cursor becomes a zoom cursor.
- Wheel up increases zoom.
- Wheel down decreases zoom.
- Zoom is clamped between `1x` and `5x`.
- The image returns to normal when zoom is reset to `1x`.

The zoom uses CSS `transform: scale(...)`.

## Overlay Zoom

Clicking a target image opens a full-page overlay.

Overlay behavior:

- Show the clicked image in the center.
- Start at `1x`.
- Wheel changes zoom level.
- Drag moves the image when zoomed.
- Escape closes the overlay.
- Clicking the background closes the overlay.

## Error Handling

If an image has no usable source, the extension does nothing.

If a page blocks loading the image in the overlay, the original page still remains unchanged.

## Testing

Manual testing will use a local test page with:

- a large image
- a small icon
- a tall image
- a wide image

Checks:

- hover cursor appears only on useful images
- wheel zoom works
- click overlay opens
- overlay wheel zoom works
- overlay drag works
- Escape and background click close overlay
