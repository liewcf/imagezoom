# Agent Instructions

Use simple english.

## Project Rules

- Keep changes small and focused.
- This project is a simple Chrome Manifest V3 extension.
- Keep the first version content-script only unless the user asks for popup, storage, icons, or a service worker.
- This folder is a git repository. Verify branch, commit, and PR state with git commands before reporting it.
- Before saying behavior is fixed, run `node --test tests/content.test.js` and `node --check content.js`.

## Project Memory Requirement

Keep these repo-level memory files accurate and concise when work changes project context:

- `docs/PROJECT_CONTEXT.md` for stable project facts, architecture, workflows, and constraints.
- `docs/DECISIONS.md` for dated technical or product decisions and rationale.
- `docs/TASKS.md` for current tasks, blockers, and next actions.
- `docs/CHANGELOG_WORK.md` for dated notes on changed files, behavior, docs, config, dependencies, tooling, tests, and verification.

Do not store secrets, credentials, API keys, private tokens, database dumps, or sensitive personal data in project memory.
