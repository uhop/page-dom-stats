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

  const rows = [
    ['DOM stats'],
    ['Total nodes', stats.dom.total],
    ['Max children', stats.dom.maxChildren, path(stats.dom.maxChildrenNode)],
    ['Max depth', stats.dom.maxDepth, path(stats.dom.maxDepthNode)],
    ['Scripts', stats.dom.scripts],
    ['Inline scripts', stats.dom.inlineScripts],
    ['CSS stats'],
    ['Total style sheets', stats.css.totalStyleSheets],
    ['Inline style sheets', stats.css.inlineStyleSheets],
    ['Unaccessible style sheets', stats.css.unaccessibleStyleSheets],
    ['Total rules', stats.css.totalRules],
    ['Total selectors', stats.css.totalSelectors],
    ['Max rules', stats.css.maxRules, src(stats.css.maxRulesSource)],
    ['Max selectors', stats.css.maxSelectors, src(stats.css.maxSelectorsSource)]
  ];

  const panel = document.createElement('div');
  panel.id = id;
  panel.style.cssText =
    'all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;max-width:420px;max-height:80vh;' +
    'overflow:auto;background:white;color:rgb(32,32,32);border:1px solid rgb(200,200,200);' +
    'border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.25);font:12px/1.5 system-ui,sans-serif;' +
    'padding:12px 16px;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:16px;';
  const title = document.createElement('b');
  title.textContent = 'Page DOM Stats';
  const close = document.createElement('button');
  close.textContent = '×';
  close.style.cssText =
    'cursor:pointer;border:none;background:none;font:16px/1 system-ui,sans-serif;';
  close.onclick = () => panel.remove();
  header.append(title, close);

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;width:100%;margin-top:4px;';
  for (const [name, value, comment] of rows) {
    const tr = document.createElement('tr');
    if (value === undefined) {
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
      tdValue.textContent = fmt.format(value);
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
