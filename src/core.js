// Shared by three shells: popup (classic script before main.js), bookmarklet, console snippet.
// Must stay fully self-contained — chrome.scripting serializes it via toString(),
// and the docs build (docs/themes/local/layouts/shortcodes/) inlines it verbatim.
// Non-universal APIs (performance.*, getComputedStyle, adoptedStyleSheets) are guarded.
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

  const percentile = (values, p) => {
    if (!values.length) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[Math.floor(p * (sorted.length - 1))];
  };

  const canComputeStyle = typeof getComputedStyle === 'function';
  const shadowRoots = [];
  const iframeDocs = [];
  const leafDepths = [];
  const childCounts = [];
  const tagCounts = {};

  const getElementStats = (node, stats, depth, hidden) => {
    ++stats.total;
    if (hidden) ++stats.hiddenNodes;
    if (node.nodeType === 3) ++stats.textNodes;
    if (node.tagName) {
      ++stats.elements;
      tagCounts[node.tagName] = (tagCounts[node.tagName] || 0) + 1;
      if (!hidden && canComputeStyle && getComputedStyle(node).display === 'none') {
        hidden = true;
        ++stats.hiddenNodes;
      }
      if (node.attributes && stats.maxAttributes < node.attributes.length) {
        stats.maxAttributes = node.attributes.length;
        stats.maxAttributesNode = getPath(node);
      }
      if (node.hasAttribute && node.hasAttribute('style')) ++stats.inlineStyleAttrs;
      if (node.shadowRoot) {
        ++stats.shadowRoots;
        shadowRoots.push(node.shadowRoot);
        for (const child of node.shadowRoot.childNodes) {
          stats.shadowNodes =
            (stats.shadowNodes || 0) + countSubtree(child, stats, depth + 1, hidden);
        }
      }
      if (node.tagName === 'IFRAME') {
        ++stats.iframes;
        let doc = null;
        try {
          doc = node.contentDocument;
        } catch {}
        if (doc && doc.documentElement) {
          iframeDocs.push(doc);
          getElementStats(doc.documentElement, stats, depth + 1, hidden);
        } else {
          ++stats.crossOriginIframes;
        }
      }
    }
    if (node.tagName === 'SCRIPT') {
      ++stats.scripts;
      if (!node.src) {
        ++stats.inlineScripts;
      }
    }
    if (node.childNodes.length) {
      childCounts.push(node.childNodes.length);
      if (node.closest && node.closest('body') && stats.maxChildren < node.childNodes.length) {
        stats.maxChildren = node.childNodes.length;
        stats.maxChildrenNode = getPath(node);
      }
      for (const child of node.childNodes) {
        getElementStats(child, stats, depth + 1, hidden);
      }
    } else {
      leafDepths.push(depth + 1);
      if (stats.maxDepth <= depth) {
        stats.maxDepth = depth + 1;
        stats.maxDepthNode = getPath(node);
      }
    }
    return stats;
  };

  // counts a shadow subtree into the shared stats and returns its own node count
  const countSubtree = (node, stats, depth, hidden) => {
    const before = stats.total;
    getElementStats(node, stats, depth, hidden);
    return stats.total - before;
  };

  // CSS

  const getStyleStats = () => {
    const stats = {
      totalStyleSheets: 0,
      inlineStyleSheets: 0,
      adoptedStyleSheets: 0,
      unaccessibleStyleSheets: 0,
      totalRules: 0,
      totalSelectors: 0,
      maxRules: 0,
      maxSelectors: 0
    };
    const process = (styleSheet, adopted) => {
      try {
        if (adopted) {
          ++stats.adoptedStyleSheets;
        } else {
          ++stats.totalStyleSheets;
          if (!styleSheet.href) ++stats.inlineStyleSheets;
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
    };
    const docs = [document, ...iframeDocs];
    for (const doc of docs) {
      for (const styleSheet of doc.styleSheets) process(styleSheet, false);
      for (const styleSheet of doc.adoptedStyleSheets || []) process(styleSheet, true);
    }
    for (const root of shadowRoots) {
      for (const styleSheet of root.adoptedStyleSheets || []) process(styleSheet, true);
    }
    return stats;
  };

  // performance one-shots (buffered entries — no early instrumentation required)

  const getPerfStats = () => {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) return {};
    const stats = {};
    const round = x => Math.round(x);
    const [nav] = performance.getEntriesByType('navigation');
    if (nav) {
      stats.ttfb = round(nav.responseStart);
      stats.domContentLoaded = round(nav.domContentLoadedEventEnd);
      stats.load = round(nav.loadEventEnd);
    }
    for (const entry of performance.getEntriesByType('paint')) {
      if (entry.name === 'first-contentful-paint') stats.fcp = round(entry.startTime);
    }
    const buffered = type => {
      if (typeof PerformanceObserver === 'undefined') return [];
      try {
        const observer = new PerformanceObserver(() => {});
        observer.observe({type, buffered: true});
        const records = observer.takeRecords();
        observer.disconnect();
        return records;
      } catch {
        return [];
      }
    };
    const lcp = buffered('largest-contentful-paint');
    if (lcp.length) stats.lcp = round(lcp[lcp.length - 1].startTime);
    const shifts = buffered('layout-shift');
    if (shifts.length) {
      let cls = 0;
      for (const shift of shifts) {
        if (!shift.hadRecentInput) cls += shift.value;
      }
      stats.cls = cls;
    }
    const resources = performance.getEntriesByType('resource');
    stats.requests = resources.length;
    stats.transferred = 0;
    const byType = {};
    for (const resource of resources) {
      stats.transferred += resource.transferSize || 0;
      byType[resource.initiatorType || 'other'] =
        (byType[resource.initiatorType || 'other'] || 0) + 1;
    }
    stats.requestsByType = byType;
    // default resource-timing buffer holds 250 entries — a full buffer means an undercount
    stats.resourceBufferFull = resources.length >= 250;
    if (document.fonts) stats.fonts = document.fonts.size;
    if (performance.memory) stats.jsHeap = performance.memory.usedJSHeapSize;
    return stats;
  };

  const domStats = getElementStats(
    document.documentElement,
    {
      total: 0,
      elements: 0,
      textNodes: 0,
      hiddenNodes: 0,
      shadowRoots: 0,
      shadowNodes: 0,
      iframes: 0,
      crossOriginIframes: 0,
      inlineStyleAttrs: 0,
      maxAttributes: 0,
      maxChildren: 0,
      maxDepth: 0,
      scripts: 0,
      inlineScripts: 0
    },
    0,
    false
  );
  domStats.p95Depth = percentile(leafDepths, 0.95);
  domStats.p95Children = percentile(childCounts, 0.95);
  domStats.topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => tag + '×' + count)
    .join(' ');

  const cssStats = getStyleStats();
  const perfStats = getPerfStats();

  // Lighthouse dom-size guidance: ~800 nodes advisory / ~1,400 excessive; 60 children; 32 depth
  const verdicts = {};
  if (domStats.total > 1400) verdicts.totalNodes = 'well above Lighthouse guidance (~800)';
  else if (domStats.total > 800) verdicts.totalNodes = 'above Lighthouse guidance (~800)';
  if (domStats.maxChildren > 60) verdicts.maxChildren = 'above Lighthouse guidance (60)';
  if (domStats.maxDepth > 32) verdicts.maxDepth = 'above Lighthouse guidance (32)';

  return {dom: domStats, css: cssStats, perf: perfStats, verdicts};
}
