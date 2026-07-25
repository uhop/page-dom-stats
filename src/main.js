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

const formatPath = path =>
  "<details><summary>Element's path</summary>" +
  path.map(part => `<code>${part}</code>`).join(' &rarr; ') +
  '</details>';

const formatUrl = url => {
  if (!url) return '<em>inline</em>';
  return `<a href="${url}" title="${url}" target="_blank">${url.replace(/\//g, '<wbr>/')}</a>`;
};

const formatBytes = bytes => {
  if (bytes === undefined) return undefined;
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + '&nbsp;MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + '&nbsp;KB';
  return bytes + '&nbsp;B';
};

const formatMs = value =>
  value === undefined ? undefined : putCommasIn(value.toFixed()) + '&nbsp;ms';

const withVerdict = (verdict, rest) => [verdict, rest].filter(Boolean).join(' ');

place('dom-total-nodes', stats.dom.total, stats.verdicts.totalNodes);
place('dom-elements', stats.dom.elements);
place('dom-text-nodes', stats.dom.textNodes);
place(
  'dom-hidden-nodes',
  stats.dom.hiddenNodes,
  stats.dom.hiddenNodes
    ? ((stats.dom.hiddenNodes / stats.dom.total) * 100).toFixed(1) + '% of total'
    : ''
);
place('dom-shadow-roots', stats.dom.shadowRoots);
place('dom-shadow-nodes', stats.dom.shadowNodes);
place(
  'dom-iframes',
  stats.dom.iframes,
  stats.dom.crossOriginIframes ? stats.dom.crossOriginIframes + ' cross-origin (not measured)' : ''
);
place('dom-top-tags', undefined, stats.dom.topTags);
place(
  'dom-max-children',
  stats.dom.maxChildren,
  withVerdict(stats.verdicts.maxChildren, formatPath(stats.dom.maxChildrenNode))
);
place('dom-p95-children', stats.dom.p95Children);
place(
  'dom-max-depth',
  stats.dom.maxDepth,
  withVerdict(stats.verdicts.maxDepth, formatPath(stats.dom.maxDepthNode))
);
place('dom-p95-depth', stats.dom.p95Depth);
place('dom-max-attributes', stats.dom.maxAttributes, formatPath(stats.dom.maxAttributesNode));
place('dom-inline-style-attrs', stats.dom.inlineStyleAttrs);
place('dom-scripts', stats.dom.scripts);
place('dom-inline-scripts', stats.dom.inlineScripts);

place('css-total-style-sheets', stats.css.totalStyleSheets);
place('css-inline-style-sheets', stats.css.inlineStyleSheets);
place('css-adopted-style-sheets', stats.css.adoptedStyleSheets);
place('css-unaccessible-style-sheets', stats.css.unaccessibleStyleSheets);
place('css-total-rules', stats.css.totalRules);
place('css-total-selectors', stats.css.totalSelectors);
place('css-max-rules', stats.css.maxRules, formatUrl(stats.css.maxRulesSource));
place('css-max-selectors', stats.css.maxSelectors, formatUrl(stats.css.maxSelectorsSource));

const perf = stats.perf;
place('perf-ttfb', formatMs(perf.ttfb));
place('perf-dcl', formatMs(perf.domContentLoaded));
place(
  'perf-load',
  perf.load ? formatMs(perf.load) : undefined,
  perf.load === 0 ? 'not finished yet' : ''
);
place('perf-fcp', formatMs(perf.fcp));
place('perf-lcp', formatMs(perf.lcp));
if (perf.cls !== undefined) place('perf-cls', perf.cls.toFixed(3));
place(
  'perf-requests',
  perf.requests,
  withVerdict(
    perf.resourceBufferFull ? 'buffer full — undercount!' : '',
    Object.entries(perf.requestsByType || {})
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => type + '×' + count)
      .join(' ')
  )
);
place('perf-transferred', formatBytes(perf.transferred));
place('perf-fonts', perf.fonts);
place('perf-js-heap', formatBytes(perf.jsHeap), perf.jsHeap !== undefined ? 'Chrome only' : '');
