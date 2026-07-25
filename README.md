# Page DOM Stats

A simple Chrome extension — plus a bookmarklet and a console snippet that run in any browser — to inspect performance-related properties of a web page: DOM size and structure (nodes, hidden/shadow DOM, depth and fan-out percentiles), CSS size (style sheets, rules, selectors), and performance one-shots (timings, requests, transferred bytes).

More information: https://uhop.github.io/page-dom-stats/

## Install

- Extension: [Chrome Web Store](https://chromewebstore.google.com/detail/page-dom-stats/odnddbdbkhgfnfiaakkdlhjmefnfpdnh), or from source — open `chrome://extensions`, enable Developer mode, click "Load unpacked", select `src/`.
- Bookmarklet and console snippet (any browser): both live on [the docs site](https://uhop.github.io/page-dom-stats/) — the bookmarklet is a drag-to-install link there (GitHub strips `javascript:` links, so it cannot be offered in this README).

## Usage

Open the page you want to inspect and click the extension's icon — the popup shows the current tab's DOM, CSS, and performance stats. The bookmarklet shows the same numbers in a removable overlay panel on the page itself; the console snippet prints them via `console.table`.

## Documentation

- The [docs site](https://uhop.github.io/page-dom-stats/) — what is measured and why.
- The [wiki](https://github.com/uhop/page-dom-stats/wiki), including the detailed [release history](https://github.com/uhop/page-dom-stats/wiki/Release-history).

## Release notes

- 1.1.0 — _Shared measurement core with two new shells (bookmarklet, console snippet); many new stats: DOM structure (hidden nodes, shadow DOM, iframes, percentiles), adopted style sheets, performance timings; Lighthouse verdicts._
- 1.0.1 — _Scripts and inline styles counted separately; element paths hidden by default; fixed-layout tables._
- 1.0.0 — _The initial release._
