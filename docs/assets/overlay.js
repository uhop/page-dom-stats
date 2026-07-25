// Bookmarklet shell: renders the stats as a removable overlay panel.
// Inlined by the docs build after core.js — measure first, then render,
// so the panel itself is never counted.
function renderStats(stats) {
  const id = 'page-dom-stats-panel';
  const old = document.getElementById(id);
  if (old) old.remove();

  const fmt = new Intl.NumberFormat('en-US');
  const path = p => (p ? p.join(' → ') : '');
  const src = u => u || 'inline';
  const note = (...parts) => parts.filter(Boolean).join(' — ');
  const ms = value => (value === undefined ? undefined : fmt.format(value) + ' ms');
  const bytes = b =>
    b === undefined
      ? undefined
      : b >= 1048576
        ? (b / 1048576).toFixed(1) + ' MB'
        : b >= 1024
          ? (b / 1024).toFixed(1) + ' KB'
          : b + ' B';

  const dom = stats.dom,
    css = stats.css,
    perf = stats.perf,
    verdicts = stats.verdicts;
  const rows = [
    ['DOM stats'],
    ['Total nodes', dom.total, verdicts.totalNodes],
    ['Elements', dom.elements],
    ['Text nodes', dom.textNodes],
    [
      'Hidden nodes',
      dom.hiddenNodes,
      dom.hiddenNodes ? ((dom.hiddenNodes / dom.total) * 100).toFixed(1) + '% of total' : ''
    ],
    ['Shadow roots', dom.shadowRoots],
    ['Shadow nodes', dom.shadowNodes],
    [
      'Iframes',
      dom.iframes,
      dom.crossOriginIframes ? dom.crossOriginIframes + ' cross-origin (not measured)' : ''
    ],
    ['Top tags', '', dom.topTags],
    ['Max children', dom.maxChildren, note(verdicts.maxChildren, path(dom.maxChildrenNode))],
    ['P95 children', dom.p95Children],
    ['Max depth', dom.maxDepth, note(verdicts.maxDepth, path(dom.maxDepthNode))],
    ['P95 depth', dom.p95Depth],
    ['Max attributes', dom.maxAttributes, path(dom.maxAttributesNode)],
    ['Inline style attributes', dom.inlineStyleAttrs],
    ['Scripts', dom.scripts],
    ['Inline scripts', dom.inlineScripts],
    ['CSS stats'],
    ['Total style sheets', css.totalStyleSheets],
    ['Inline style sheets', css.inlineStyleSheets],
    ['Adopted style sheets', css.adoptedStyleSheets],
    ['Unaccessible style sheets', css.unaccessibleStyleSheets],
    ['Total rules', css.totalRules],
    ['Total selectors', css.totalSelectors],
    ['Max rules', css.maxRules, src(css.maxRulesSource)],
    ['Max selectors', css.maxSelectors, src(css.maxSelectorsSource)],
    ['Performance'],
    ['Time to first byte', ms(perf.ttfb)],
    ['DOMContentLoaded', ms(perf.domContentLoaded)],
    ['Load', perf.load === 0 ? 'not finished yet' : ms(perf.load)],
    ['First contentful paint', ms(perf.fcp)],
    ['Largest contentful paint', ms(perf.lcp)],
    ['Cumulative layout shift', perf.cls === undefined ? undefined : perf.cls.toFixed(3)],
    [
      'Requests',
      perf.requests,
      note(
        perf.resourceBufferFull ? 'buffer full — undercount!' : '',
        Object.entries(perf.requestsByType || {})
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => type + '×' + count)
          .join(' ')
      )
    ],
    ['Transferred', bytes(perf.transferred)],
    ['Fonts', perf.fonts],
    ['JS heap', bytes(perf.jsHeap)]
  ];

  const panel = document.createElement('div');
  panel.id = id;
  panel.style.cssText =
    'all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;max-width:440px;max-height:80vh;' +
    'overflow:auto;background:white;color:rgb(32,32,32);border:1px solid rgb(200,200,200);' +
    'border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.25);font:12px/1.5 system-ui,sans-serif;' +
    'padding:12px 16px;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:16px;';
  const title = document.createElement('b');
  title.textContent = 'Page DOM Stats';
  const close = document.createElement('button');
  close.textContent = '×';
  // generous hit target + pointerdown: a click event needs press and release on the
  // same element, so a tiny target loses near-miss clicks entirely
  close.style.cssText =
    'cursor:pointer;border:none;background:none;font:16px/1 system-ui,sans-serif;' +
    'padding:6px 10px;margin:-6px -10px;';
  close.addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    panel.remove();
  });
  close.addEventListener('click', () => panel.remove());
  header.append(title, close);

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;width:100%;margin-top:4px;';
  for (const row of rows) {
    const [name, value, comment] = row;
    const isSection = row.length === 1;
    if (!isSection && (value === undefined || value === '') && !comment) continue;
    const tr = document.createElement('tr');
    if (isSection) {
      const th = document.createElement('th');
      th.colSpan = 3;
      th.textContent = name;
      th.style.cssText = 'text-align:left;padding:8px 4px 2px;font-size:13px;';
      tr.appendChild(th);
    } else {
      const tdName = document.createElement('td');
      tdName.textContent = name;
      tdName.style.cssText = 'padding:2px 4px;vertical-align:top;';
      const tdValue = document.createElement('td');
      tdValue.textContent = typeof value === 'number' ? fmt.format(value) : value || '';
      tdValue.style.cssText = 'padding:2px 4px;text-align:right;vertical-align:top;';
      const tdComment = document.createElement('td');
      tdComment.textContent = comment || '';
      tdComment.style.cssText =
        'padding:2px 4px;color:rgb(120,120,120);overflow-wrap:anywhere;vertical-align:top;';
      tr.append(tdName, tdValue, tdComment);
    }
    table.appendChild(tr);
  }

  panel.append(header, table);
  (document.body || document.documentElement).appendChild(panel);
}
