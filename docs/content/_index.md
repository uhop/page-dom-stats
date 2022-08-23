+++
title = "Page DOM stats"
date = "2022-08-07T14:41:40-05:00"
slug = "/"
+++

Install the current version: [chrome web store](https://chrome.google.com/webstore/detail/page-dom-stats/odnddbdbkhgfnfiaakkdlhjmefnfpdnh?hl=en&authuser=0)

# Info

This is a simple Chrome extension to inspect performance-related properties of a web page:

* DOM size:
  * Total number of DOM nodes
  * Maximum number of children
  * Maximum depth
  * Total number of scripts
* CSS size:
  * Total number of style sheets
  * Total number of rules
  * Total number of selectors
  * Maximum number of rules
  * Maximum number of selectors

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

* "Avoid an excessive DOM size": https://web.dev/dom-size/

The article advises to keep a number of DOM nodes under 800 and explains how Lighthouse checks a tree depth and
a number of children/parent elements.

But who in their right mind would create a web page with thousands of DOM elements and CSS rules? Unfortunately
it is easy:

* Tables are the bread and butter of IT. A simple table with 100 rows (a quite common setup), 10 properties
  per row, which requires one `<td>` element and one `<span>` (for styling!) will make your web page heavier
  than 2,000 DOM elements instantly.
  * Even if you have parts of tree hidden (e.g., `display: none`) they still count.
* Using CSS preprocessors indiscriminately may cause a CSS rule explosion when generating CSS and/or generate
  overly long and specific selectors.

That's why I decided to create a simple Chrome extension that will help me to do spot checks of web applications
allowing me to keep an eye on their DOM/CSS complexity and structure.

# Code

This is an open source project under the BSD-3-Clause license: [git repo](https://github.com/uhop/page-dom-stats).

All pertinent information can be found in [the wiki](https://github.com/uhop/page-dom-stats/wiki)
including [the release history](https://github.com/uhop/page-dom-stats/wiki/Release-history).
