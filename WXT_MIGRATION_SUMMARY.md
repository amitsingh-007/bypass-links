# WXT Migration Plan and Summary

## Original Plan

- Migrate the extension build from Webpack to WXT (Chrome-only, MV3).
- Keep code changes minimal and retain feature parity.
- Replace popup entry with popup.html and update tests/CI paths.
- Remove Firefox-specific packaging and Webpack artifacts.
- Use the latest supported Vite/WXT versions.
- Stabilize E2E auth setup for the new build output.

## Summary of Changes Done

- Added WXT config and entrypoints (popup/background) for Chrome MV3.
- Switched popup to popup.html and aligned routes/tests to the new entry.
- Moved extension assets to WXT public output.
- Updated extension scripts/deps, removed Webpack/Firefox build tooling.
- Updated CI, turbo outputs, and lint ignores for .output.
- Upgraded WXT to 0.20.14 and pinned Vite to 7.3.1 via overrides.
- Adjusted auth/setup flow to avoid post-login sync on test auth.
