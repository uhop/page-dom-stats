const gatherStats = () => {
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
      unaccessibleStyleSheets: 0,
      totalRules: 0,
      totalSelectors: 0,
      maxRules: 0,
      maxSelectors: 0
    };
    for (const styleSheet of document.styleSheets) {
      try {
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
      } catch (error) {
        ++stats.unaccessibleStyleSheets;
      }
    }
    return stats;
  };

  const cssStats = getStyleStats(),
    domStats = getElementStats(
      document.documentElement,
      {total: 0, maxChildren: 0, maxDepth: 0},
      0
    );
  return {dom: domStats, css: cssStats};
};

const [tab] = await chrome.tabs.query({active: true, currentWindow: true}),
  [{result: stats}] = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: gatherStats
  });

const putCommasIn = s => {
  if (s.length < 4) return s;
  const r = s.length % 3;
  return (
    (r ? s.slice(0, r) + ',' : '') +
    s
      .slice(r)
      .replace(/(\d{3})/g, '$1,')
      .slice(0, -1)
  );
};

const place = (id, value, comment) => {
  const tr = document.getElementById(id);
  if (!tr || tr.tagName !== 'TR') return;
  const cells = tr.querySelectorAll('td');
  if (cells.length > 1) {
    if (!isNaN(value) && isFinite(value)) {
      cells[1].innerHTML = putCommasIn(value.toFixed());
    } else if (value) {
      cells[1].innerHTML = value;
    }
  }
  if (cells.length > 2 && (typeof comment == 'number' || comment)) {
    cells[2].innerHTML = comment;
  }
};

const formatPath = path => path.map(part => `<code>${part}</code>`).join(' &rarr; ');

const formatUrl = url => {
  if (!url) return '<em>inline</em>';
  return `<a href="${url}" target="_blank">${url}</a>`;
}

place('dom-total-nodes', stats.dom.total);
place('dom-max-children', stats.dom.maxChildren, formatPath(stats.dom.maxChildrenNode));
place('dom-max-depth', stats.dom.maxDepth, formatPath(stats.dom.maxDepthNode));

place('css-total-style-sheets', stats.css.totalStyleSheets);
place('css-unaccessible-style-sheets', stats.css.unaccessibleStyleSheets);
place('css-total-rules', stats.css.totalRules);
place('css-total-selectors', stats.css.totalSelectors);
place('css-max-rules', stats.css.maxRules, formatUrl(stats.css.maxRulesSource));
place('css-max-selectors', stats.css.maxSelectors, formatUrl(stats.css.maxSelectorsSource));
