# Tasks

## Recommended Next Action

- Load the extension through `chrome://extensions` as unpacked and test it on one real image-heavy website.

## Current

- [ ] Verify unpacked-extension loading through Chrome's extension manager.

## Verification

- Verified locally on 2026-05-29:
  - `python3 -m json.tool manifest.json` passed.
  - `node --check content.js` passed.
  - `node --test tests/content.test.js` passed with `10/10` tests.
  - `main` contains commit `259a266` with the `srcset` overlay source upgrade.
  - `rg -n "\"icons\"|\"default_icon\"" manifest.json` returned no matches, as expected.
  - Manual browser check through `tests/manual.html` covered inline wheel zoom, reset, overlay open, overlay zoom, overlay drag, Escape close, background click close, and tiny-image ignored.
- Not yet verified:
  - Loading the folder through `chrome://extensions`.
  - Behavior on a real external website with the extension installed.

## Blockers

- None recorded.

## Done

- [x] Built `0.1.0` Manifest V3 extension scaffold.
- [x] Added hover, inline wheel zoom, click overlay zoom, overlay wheel zoom, drag pan, Escape close, and background click close.
- [x] Added Node tests for image filtering, inline zoom, overlay open/close, zero-delta wheel handling, and zoom-bound scroll behavior.
- [x] Added on-demand overlay source upgrade from existing larger `srcset` candidates.
- [x] Added `tests/manual.html` local manual test page.
- [x] Added README install and usage notes.
