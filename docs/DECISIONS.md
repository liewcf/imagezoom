# Decisions

## 2026-05-29

- Use a Manifest V3 content-script-only extension for `0.1.0`. Rationale: the requested behavior can run directly on pages without popup UI, service worker state, storage, or extra permissions.
- Match `<all_urls>` for the content script. Rationale: the feature is meant to work on images across websites. The README warns that the extension runs on all web pages.
- Omit custom icons for now. Rationale: Chrome can use its default icon, and the manifest must not reference missing icon files.
- Ignore images smaller than `80px` by both rendered and natural dimensions. Rationale: this avoids most icons, avatars, sprites, unloaded images, and tracking pixels.
- Do not block wheel events when zoom cannot change or `deltaY === 0`. Rationale: page scrolling should keep working at zoom bounds and for horizontal or zero-delta wheel gestures.
