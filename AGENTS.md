# AGENTS.md

Page DOM Stats — a Manifest V3 Chrome extension that gathers DOM and CSS statistics for the active tab. A personal tool; docs: https://uhop.github.io/page-dom-stats/

## Layout

- `src/` — the extension: `manifest.json` (the version of record — there is no `package.json`), `popup.html` + `main.css` (the popup UI), `main.js` (popup logic plus the injected `gatherStats`). Dependency-free vanilla JS, no build step.
- `docs/` — Hugo site published to GitHub Pages by `.github/workflows/pages.yml`; `docs/themes/local` is a project-local theme, not a vendored third party.
- `wiki/` — the GitHub wiki as an HTTPS submodule; carries the detailed release history.

## Develop / test

- Extension: `chrome://extensions` → Developer mode → Load unpacked → `src/`. Exercise the popup on a real page; there is no automated test suite.
- Docs: `cd docs && hugo server` to preview; `hugo` builds into `docs/public` (gitignored).

## Gate before shipping

- `npx prettier --check .` is clean (no `package.json` — prettier runs via npx; exclusions in `.prettierignore`).
- `cd docs && hugo` builds with no errors and no deprecation warnings — the installed Hugo moves faster than this site, so a clean local build is the docs gate.

## Code style

- Prettier + `.editorconfig` govern formatting.
- Comments are _why_-markers only (a non-trivial decision or constraint, an algorithm reference); never narrate _what_ the code does.

## Releases

- The version of record is `src/manifest.json#version`; git tags are bare semver (no `v` prefix).
- Ship: commit + tag, then upload the packed extension to the [Chrome Web Store](https://chromewebstore.google.com/detail/page-dom-stats/odnddbdbkhgfnfiaakkdlhjmefnfpdnh) (user-side, developer dashboard).
- Release notes: cliff-notes in README; detail in the wiki's [Release history](https://github.com/uhop/page-dom-stats/wiki/Release-history).
