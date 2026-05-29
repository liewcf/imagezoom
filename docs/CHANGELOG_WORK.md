# Work Changelog

## 2026-05-29

- Initialized Git repository in the project root. Current branch after initialization was `main` with no commits yet.
- Initialized project memory files: `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/DECISIONS.md`, `docs/TASKS.md`, and `docs/CHANGELOG_WORK.md`.
- Added Chrome extension files: `manifest.json`, `content.js`, and `styles.css`.
- Added extension behavior: useful-image detection, hover cursor class, inline wheel zoom, click overlay zoom, overlay wheel zoom, drag pan, Escape close, background click close, and tiny-image filtering.
- Added guard behavior so inline and overlay wheel handlers do not block scroll when zoom cannot change or when `deltaY === 0`.
- Added tests in `tests/content.test.js`; latest verified result is `9/9` passing with `node --test tests/content.test.js`.
- Added `tests/manual.html` for local browser checks with large, tall, wide, and tiny data-URI images.
- Added `README.md` with usage, unpacked Chrome install steps, local test page note, and `<all_urls>` safety note.
- Added Superpowers design and implementation plan docs under `docs/superpowers/`.
