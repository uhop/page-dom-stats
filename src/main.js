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

place('dom-total-nodes', stats.dom.total);
place('dom-max-children', stats.dom.maxChildren, formatPath(stats.dom.maxChildrenNode));
place('dom-max-depth', stats.dom.maxDepth, formatPath(stats.dom.maxDepthNode));
place('dom-scripts', stats.dom.scripts);
place('dom-inline-scripts', stats.dom.inlineScripts);

place('css-total-style-sheets', stats.css.totalStyleSheets);
place('css-inline-style-sheets', stats.css.inlineStyleSheets);
place('css-unaccessible-style-sheets', stats.css.unaccessibleStyleSheets);
place('css-total-rules', stats.css.totalRules);
place('css-total-selectors', stats.css.totalSelectors);
place('css-max-rules', stats.css.maxRules, formatUrl(stats.css.maxRulesSource));
place('css-max-selectors', stats.css.maxSelectors, formatUrl(stats.css.maxSelectorsSource));
