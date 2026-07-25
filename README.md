# Page DOM Stats

A simple Chrome extension to inspect performance-related properties of a web page: DOM size (total nodes, max children, max depth, scripts) and CSS size (style sheets, rules, selectors — totals and maxima).

More information: https://uhop.github.io/page-dom-stats/

## Install

- [Chrome Web Store](https://chromewebstore.google.com/detail/page-dom-stats/odnddbdbkhgfnfiaakkdlhjmefnfpdnh)
- From source: open `chrome://extensions`, enable Developer mode, click "Load unpacked", select `src/`.

## Usage

Open the page you want to inspect and click the extension's icon — the popup shows the current tab's DOM and CSS stats.

## Documentation

- The [docs site](https://uhop.github.io/page-dom-stats/) — what is measured and why.
- The [wiki](https://github.com/uhop/page-dom-stats/wiki), including the detailed [release history](https://github.com/uhop/page-dom-stats/wiki/Release-history).

## Release notes

- 1.1.0 — _Shared measurement core with two new shells (bookmarklet, console snippet); many new stats: DOM structure (hidden nodes, shadow DOM, iframes, percentiles), adopted style sheets, performance timings; Lighthouse verdicts._
- 1.0.1 — _Scripts and inline styles counted separately; element paths hidden by default; fixed-layout tables._
- 1.0.0 — _The initial release._
