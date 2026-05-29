# Work Changelog

## 2026-05-29

- Initialized Git repository in the project root. Current branch after initialization was `main` with no commits yet.
- Initialized project memory files: `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/DECISIONS.md`, `docs/TASKS.md`, and `docs/CHANGELOG_WORK.md`.
- Added Chrome extension files: `manifest.json`, `content.js`, and `styles.css`.
- Added extension behavior: useful-image detection, hover cursor class, inline wheel zoom, click overlay zoom, overlay wheel zoom, drag pan, Escape close, background click close, and tiny-image filtering.
- Added guard behavior so inline and overlay wheel handlers do not block scroll when zoom cannot change or when `deltaY === 0`.
- Added tests in `tests/content.test.js`; latest verified result is `10/10` passing with `node --test tests/content.test.js`.
- Added on-demand overlay source upgrade from existing larger `srcset` candidates.
- Merged the overlay source upgrade to `main` at commit `259a266`; the temporary `codex/optimize-zoomed-images-on-demand` branch was deleted after merge.
- Added `tests/manual.html` for local browser checks with large, tall, wide, and tiny data-URI images.
- Added `README.md` with usage, unpacked Chrome install steps, local test page note, and `<all_urls>` safety note.
- Added Superpowers design and implementation plan docs under `docs/superpowers/`.
- Prepared Chrome Web Store submission assets and docs: added `CHROMEWEBSTORE.md`, `PRIVACY.md`, `.gitignore`, `scripts/package-extension.sh`, PNG icons in `icons/`, store graphics in `store-assets/`, and manifest readiness tests in `tests/manifest.test.js`.
- Updated `manifest.json` to use real icon files and narrow content script matches to `http://*/*` and `https://*/*`.
- Updated `README.md` with the Chrome Web Store package command and privacy/listing note.
- Created `dist/image-zoom-v0.1.0.zip` with only `manifest.json`, `content.js`, `styles.css`, and `icons/`; the ZIP is ignored by git.
- Verified Chrome Web Store readiness with `node --check content.js`, `node --test tests/content.test.js`, `node --test tests/manifest.test.js`, `python3 -m json.tool manifest.json`, `sh -n scripts/package-extension.sh`, `unzip -t dist/image-zoom-v0.1.0.zip`, `git diff --check`, asset dimension checks, secret-pattern scan, and manual browser screenshot capture.
- Refreshed `README.md` into a fuller public-facing guide covering features, local install, manual test page, Chrome Web Store packaging, privacy, development checks, and remaining owner submission steps.
- Fixed the security scan finding for global overlay CSS by moving `.iz-overlay` and `.iz-overlay-image` styling out of `styles.css` and into inline `!important` styles applied by `content.js` only to extension-created overlay elements.
- Added a regression test that fails if `styles.css` exposes global `.iz-overlay` selectors to page-owned DOM.
- Regenerated `dist/image-zoom-v0.1.0.zip` after the security fix so the package no longer contains the old global overlay CSS.
