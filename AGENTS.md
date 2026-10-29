# chrome-multi-row-bookmarks

**Chrome extension (Manifest V3) that replaces Chrome's single-row bookmarks bar with a configurable multi-row toolbar (2–4 rows) with drag-and-drop.** Also overrides the new-tab page.

## Where This Fits in the APT Portfolio

**Linear team:** `APT` (APT Tools).

Standalone productivity utility — no dependencies on other APT repos. See [`https://github.com/apt-inc-ai/apt-onboarding/blob/main/CLAUDE.md`](https://github.com/apt-inc-ai/apt-onboarding/blob/main/CLAUDE.md) for the portfolio map.

## What's In Here

- `manifest.json` — Manifest V3 declaration; permissions: `bookmarks`, `storage`.
- `background/service-worker.js` — Background service worker (module type).
- `content/` — Content scripts injected on `<all_urls>`: `toolbar.js`, `folder-dropdown.js`, `drag-drop.js`, `content.js`.
- `shared/` — Shared helpers: `constants.js`, `favicon.js`.
- `newtab/newtab.html` — New-tab-page override.
- `options/options.html` — Options UI (opens in its own tab).
- `icons/` — 16/32/48/128 px extension icons.

## How to Run

Load as an unpacked extension in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked" and select this repo's root directory.
4. Pin the extension to access the options page.

No build step — plain ES modules loaded directly by Chrome.

## Git Rules

Inherited from [global CLAUDE.md](~/.claude/CLAUDE.md). Never commit/push without explicit ask.

## Owner & Contacts

- **Primary maintainer:** Greg McMillan (gmcmillan@apt-inc.com)
- **Linear team:** `APT`

---

*Skeleton created 2026-04-19 via `apt-onboarding/templates/CLAUDE.md.template`. Expand as needed.*
