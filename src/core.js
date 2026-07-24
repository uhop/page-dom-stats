// Shared by three shells: popup (classic script before main.js), bookmarklet, console snippet.
// Must stay fully self-contained — chrome.scripting serializes it via toString(),
// and the docs build (docs/themes/local/layouts/shortcodes/) inlines it verbatim.
function gatherStats() {
  // DOM

  const getName = element => {
    const parts = [];
    do {
      if (!element.tagName) {
        parts.push(element.nodeName);
        break;
      }
      parts.push(element.tagName);
      if (element.id) {
        parts.push('#' + element.id);
        break;
      }
      if (element.classList) parts.push(...Array.from(element.classList).map(c => '.' + c));
    } while (false);
    return parts.join('');
  };

  const getPath = node => {
    const parts = [];
    while (node && node !== document) {
      parts.push(getName(node));
      node = node.parentNode;
    }
    return parts.reverse();
  };

  const getElementStats = (node, stats, depth) => {
    ++stats.total;
    if (node.tagName === 'SCRIPT') {
      ++stats.scripts;
      if (!node.src) {
        ++stats.inlineScripts;
      }
    }
    if (node.childNodes.length) {
      if (node.closest && node.closest('body') && stats.maxChildren < node.childNodes.length) {
        stats.maxChildren = node.childNodes.length;
        stats.maxChildrenNode = getPath(node);
      }
      for (const child of node.childNodes) {
        getElementStats(child, stats, depth + 1);
      }
    } else {
      if (stats.maxDepth <= depth) {
        stats.maxDepth = depth + 1;
        stats.maxDepthNode = getPath(node);
      }
    }
    return stats;
  };

  // CSS

  const getStyleStats = () => {
    const stats = {
      totalStyleSheets: document.styleSheets.length,
      inlineStyleSheets: 0,
      unaccessibleStyleSheets: 0,
      totalRules: 0,
      totalSelectors: 0,
      maxRules: 0,
      maxSelectors: 0
    };
    for (const styleSheet of document.styleSheets) {
      try {
        if (!styleSheet.href) {
          ++stats.inlineStyleSheets;
        }
        stats.totalRules += styleSheet.cssRules.length;
        if (stats.maxRules < styleSheet.cssRules.length) {
          stats.maxRules = styleSheet.cssRules.length;
          stats.maxRulesSource = styleSheet.href;
        }
        let totalSelectors = 0;
        for (const rule of styleSheet.cssRules) {
          if (rule.selectorText) totalSelectors += rule.selectorText.split(',').length;
        }
        stats.totalSelectors += totalSelectors;
        if (stats.maxSelectors < totalSelectors) {
          stats.maxSelectors = totalSelectors;
          stats.maxSelectorsSource = styleSheet.href;
        }
      } catch {
        ++stats.unaccessibleStyleSheets;
      }
    }
    return stats;
  };

  const cssStats = getStyleStats(),
    domStats = getElementStats(
      document.documentElement,
      {total: 0, maxChildren: 0, maxDepth: 0, scripts: 0, inlineScripts: 0},
      0
    );
  return {dom: domStats, css: cssStats};
}
