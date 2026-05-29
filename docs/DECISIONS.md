# Decisions

## 2026-05-29

- Use a Manifest V3 content-script-only extension for `0.1.0`. Rationale: the requested behavior can run directly on pages without popup UI, service worker state, storage, or extra permissions.
- Use `http://*/*` and `https://*/*` content-script matches for the Chrome Web Store build instead of `<all_urls>`. Rationale: this keeps site access narrower while still covering normal web pages.
- Add real PNG icon files at the manifest-declared sizes for Chrome Web Store readiness. Rationale: store submission needs a 128px icon, and the manifest must not reference missing files.
- Ignore images smaller than `80px` by both rendered and natural dimensions. Rationale: this avoids most icons, avatars, sprites, unloaded images, and tracking pixels.
- Do not block wheel events when zoom cannot change or `deltaY === 0`. Rationale: page scrolling should keep working at zoom bounds and for horizontal or zero-delta wheel gestures.
- Prefer an existing larger `srcset` candidate for the overlay. Rationale: this gives better pixels on demand without AI upscaling, storage, a service worker, or extra permissions.
- Keep overlay UI styles out of the injected global stylesheet. Rationale: page-owned DOM with extension-like class names must not inherit full-screen overlay styling; `content.js` applies those styles only to extension-created elements.
- Keep the Chrome Web Store ZIP minimal: `manifest.json`, `content.js`, `styles.css`, and `icons/` only. Rationale: docs, tests, local memory, package scripts, and store-only assets are not extension runtime files.
- Disclose no user data collection. Rationale: the extension processes page image elements locally, uses no storage or analytics, and sends no data to the developer.
