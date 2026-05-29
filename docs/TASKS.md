# Tasks

## Recommended Next Action

- Host `PRIVACY.md` at a public HTTPS URL, fill in owner publisher/contact fields in `CHROMEWEBSTORE.md`, then load the extension through `chrome://extensions` and test it on one real image-heavy website before submitting `dist/image-zoom-v0.1.0.zip`.

## Current

- [ ] Host the privacy policy at a public HTTPS URL.
- [ ] Fill owner publisher name, contact email, support URL or email, and homepage URL in the Chrome Developer Dashboard.
- [ ] Verify unpacked-extension loading through Chrome's extension manager.
- [ ] Test the installed extension on one real external image-heavy website.

## Verification

- Verified locally on 2026-05-29:
  - `python3 -m json.tool manifest.json` passed.
  - `node --check content.js` passed.
  - `node --test tests/content.test.js` passed with `11/11` tests after adding the overlay CSS collision regression.
  - `node --test` passed with all content and manifest tests after the overlay CSS security fix.
  - `rg -n "(^|})\\s*\\.iz-overlay\\b" styles.css` returned no matches after the overlay CSS security fix.
  - `unzip -p dist/image-zoom-v0.1.0.zip styles.css | rg -n "(^|})\\s*\\.iz-overlay\\b"` returned no matches after regenerating the package.
  - `node --test tests/manifest.test.js` passed with `3/3` tests.
  - `sh -n scripts/package-extension.sh` passed.
  - `scripts/package-extension.sh` created `dist/image-zoom-v0.1.0.zip`.
  - `unzip -t dist/image-zoom-v0.1.0.zip` passed.
  - `unzip -l dist/image-zoom-v0.1.0.zip` showed only `manifest.json`, `content.js`, `styles.css`, and `icons/`.
  - Store assets were checked with `file`: icons are 16x16, 48x48, and 128x128 PNG; screenshot is 1280x800 PNG; promo tile is 440x280 PNG.
  - Browser manual page check produced no console errors and captured the overlay screenshot.
  - `main` contains commit `259a266` with the `srcset` overlay source upgrade.
  - Manual browser check through `tests/manual.html` covered inline wheel zoom, reset, overlay open, overlay zoom, overlay drag, Escape close, background click close, and tiny-image ignored.
- Not yet verified:
  - Loading the folder through `chrome://extensions`.
  - Behavior on a real external website with the extension installed.
  - Chrome Developer Dashboard upload and review.

## Blockers

- None recorded.

## Done

- [x] Built `0.1.0` Manifest V3 extension scaffold.
- [x] Added hover, inline wheel zoom, click overlay zoom, overlay wheel zoom, drag pan, Escape close, and background click close.
- [x] Added Node tests for image filtering, inline zoom, overlay open/close, zero-delta wheel handling, and zoom-bound scroll behavior.
- [x] Added on-demand overlay source upgrade from existing larger `srcset` candidates.
- [x] Added `tests/manual.html` local manual test page.
- [x] Added README install and usage notes.
- [x] Prepared Chrome Web Store files: `CHROMEWEBSTORE.md`, `PRIVACY.md`, PNG icons, store assets, package script, and clean submission ZIP.
