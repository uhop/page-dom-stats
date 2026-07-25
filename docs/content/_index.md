+++
title = "Page DOM stats"
date = "2022-08-07T14:41:40-05:00"
slug = "/"
+++

Install the current version: [chrome web store](https://chrome.google.com/webstore/detail/page-dom-stats/odnddbdbkhgfnfiaakkdlhjmefnfpdnh?hl=en&authuser=0)
— or, for any browser, drag this link to your bookmarks bar: {{< bookmarklet >}} (see
[details below](#bookmarklet-and-console)).

# Info

This is a simple Chrome extension to inspect performance-related properties of a web page:

- DOM size and structure:
  - Total number of nodes, split into elements and text nodes
  - Hidden nodes — inside `display: none` subtrees
  - Shadow DOM: number of roots and nodes in shadow trees
  - Iframes — same-origin ones are measured too; cross-origin ones are counted as unmeasurable
  - Top tags by frequency
  - Maximum and 95th-percentile number of children (fan-out)
  - Maximum and 95th-percentile depth
  - Maximum number of attributes per element and the number of inline `style` attributes
  - Number of scripts, including inline ones
- CSS size:
  - Style sheets: total, inline, adopted, and unaccessible (cross-origin)
  - Rules and selectors: totals and per-sheet maxima
- Performance:
  - Timings: time to first byte, `DOMContentLoaded`, load, first contentful paint, largest contentful
    paint, cumulative layout shift
  - Requests and transferred bytes, broken down by type
  - Number of loaded fonts and the JS heap size (Chrome)
- Verdicts against Lighthouse guidance where a value crosses it: total nodes, children, depth

Sample output:

![Sample](/images/sample.png)

# Motivation

Working on some clients projects I noticed that at that time browsers had limits that broke some websites.
Sometimes visuals were not updated properly. Sometimes timers were not called on time. It turned out that
all those problems correlated with number of CSS rules and/or DOM nodes. At that time the "magic" number
looked like ~10,000 nodes/rules. I learned the hard way not to cross this number.

Nowadays browsers are more scalable but it doesn't mean we can forget about DOM/CSS limits. Animations and
transitions frequently test our web design favoring simple solutions. Users like fast web applications too.

Being fast has direct impact on SEO. Even Google's Lighthouse takes it into consideration:

- "Avoid an excessive DOM size": https://web.dev/dom-size/

The article advises to keep a number of DOM nodes under 800 and explains how Lighthouse checks a tree depth and
a number of children/parent elements.

But who in their right mind would create a web page with thousands of DOM elements and CSS rules? Unfortunately
it is easy:

- Tables are the bread and butter of IT. A simple table with 100 rows (a quite common setup), 10 properties
  per row, which requires one `<td>` element and one `<span>` (for styling!) will make your web page heavier
  than 2,000 DOM elements instantly.
  - Even if you have parts of tree hidden (e.g., `display: none`) they still count.
- Using CSS preprocessors indiscriminately may cause a CSS rule explosion when generating CSS and/or generate
  overly long and specific selectors.

That's why I decided to create a simple Chrome extension that will help me to do spot checks of web applications
allowing me to keep an eye on their DOM/CSS complexity and structure.

# Bookmarklet and console

The extension itself runs on desktop Chromium browsers. Two more shells run the same measurement core in any browser:

**Bookmarklet**: drag this link to the bookmarks bar, then click it on any page: {{< bookmarklet >}}. It is fully
self-contained, so it works on pages with a strict CSP. Click it again to refresh the numbers; the panel has a
close button. Known limitation: Epiphany (GNOME Web) does not support `javascript:` bookmarks (activating one
crashes it) — there, click the link directly on this page, or use the console snippet below.

**Console snippet**: paste into the DevTools console of any browser (Chrome asks to type "allow pasting" first):

{{< console-snippet >}}

# Code

This is an open source project under the BSD-3-Clause license: [git repo](https://github.com/uhop/page-dom-stats).

All pertinent information can be found in [the wiki](https://github.com/uhop/page-dom-stats/wiki)
including [the release history](https://github.com/uhop/page-dom-stats/wiki/Release-history).
