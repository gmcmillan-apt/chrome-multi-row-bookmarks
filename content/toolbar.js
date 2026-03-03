// CSS injected into shadow root
var TOOLBAR_CSS = '\
* { box-sizing: border-box; margin: 0; padding: 0; }\
\
.mrbb-row {\
  display: flex;\
  align-items: center;\
  height: var(--row-height, 28px);\
  background: var(--bg, #f1f3f4);\
  border-bottom: 1px solid var(--border, #dadce0);\
  padding: 0 8px;\
  overflow: hidden;\
  user-select: none;\
}\
\
.mrbb-row.drag-over {\
  background: var(--drag-bg, #e8f0fe);\
}\
\
.mrbb-item {\
  display: inline-flex;\
  align-items: center;\
  gap: 4px;\
  padding: 2px 6px;\
  border-radius: 4px;\
  cursor: pointer;\
  white-space: nowrap;\
  font-size: 13px;\
  color: var(--text, #202124);\
  max-width: 180px;\
  flex-shrink: 0;\
  transition: background 0.15s;\
}\
\
.mrbb-item:hover {\
  background: var(--hover, #dee1e6);\
}\
\
.mrbb-item.dragging {\
  opacity: 0.4;\
}\
\
.mrbb-item img {\
  width: 16px;\
  height: 16px;\
  flex-shrink: 0;\
}\
\
.mrbb-item span {\
  overflow: hidden;\
  text-overflow: ellipsis;\
}\
\
.mrbb-folder-arrow {\
  font-size: 10px;\
  margin-left: 2px;\
  color: var(--arrow, #5f6368);\
}\
\
.mrbb-dropdown {\
  position: fixed;\
  background: var(--dropdown-bg, #fff);\
  border: 1px solid var(--border, #dadce0);\
  border-radius: 8px;\
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);\
  padding: 4px 0;\
  min-width: 200px;\
  max-height: 400px;\
  overflow-y: auto;\
  z-index: 2147483647;\
}\
\
.mrbb-dropdown-item {\
  display: flex;\
  align-items: center;\
  gap: 8px;\
  padding: 6px 12px;\
  font-size: 13px;\
  color: var(--text, #202124);\
  cursor: pointer;\
  text-decoration: none;\
}\
\
.mrbb-dropdown-item:hover {\
  background: var(--hover, #f1f3f4);\
}\
\
.mrbb-dropdown-item img {\
  width: 16px;\
  height: 16px;\
  flex-shrink: 0;\
}\
\
.mrbb-subfolder-arrow {\
  margin-left: auto;\
  font-size: 10px;\
  color: var(--arrow, #5f6368);\
}\
\
.mrbb-subfolder-group {\
  padding-left: 16px;\
}\
\
.mrbb-row[data-theme="dark"] {\
  --bg: #292a2d;\
  --text: #e8eaed;\
  --border: #3c4043;\
  --hover: #3c4043;\
  --drag-bg: #1a3a5c;\
  --arrow: #9aa0a6;\
  --dropdown-bg: #292a2d;\
}\
';

/**
 * Render the complete toolbar.
 * @param {ShadowRoot|Document} root - shadow root or document (for newtab)
 * @param {HTMLElement} container - toolbar container element
 * @param {Object} state - { rows, settings }
 * @param {Function} updatePageOffset - callback(totalHeightPx)
 */
function renderToolbar(root, container, state, updatePageOffset) {
  var rows = state.rows;
  var settings = state.settings;
  var rowHeight = settings.rowHeight || DEFAULTS.ROW_HEIGHT;
  var theme = resolveTheme(settings.theme);

  container.innerHTML = '';
  closeFolderDropdown(root);

  for (var ri = 0; ri < rows.length; ri++) {
    var rowItems = rows[ri];
    var rowEl = document.createElement('div');
    rowEl.className = 'mrbb-row';
    rowEl.dataset.row = ri;
    rowEl.dataset.theme = theme;
    rowEl.style.height = rowHeight + 'px';

    setupRowDropTarget(rowEl, ri);

    for (var ii = 0; ii < rowItems.length; ii++) {
      var el = createBookmarkElement(rowItems[ii], root);
      setupDraggable(el, rowItems[ii]);
      rowEl.appendChild(el);
    }

    container.appendChild(rowEl);
  }

  var totalHeight = rows.length * (rowHeight + 1);
  updatePageOffset(totalHeight);

  // Width correction pass after layout
  requestAnimationFrame(function() {
    correctOverflow(container, rows, settings);
  });
}

function createBookmarkElement(item, root) {
  var el = document.createElement('div');
  el.className = 'mrbb-item';
  el.dataset.id = item.id;
  el.draggable = true;

  if (item.isFolder) {
    var icon = document.createElement('span');
    icon.textContent = '\uD83D\uDCC1';
    el.appendChild(icon);

    var label = document.createElement('span');
    label.textContent = item.title || 'Untitled';
    el.appendChild(label);

    var arrow = document.createElement('span');
    arrow.className = 'mrbb-folder-arrow';
    arrow.textContent = '\u25BE';
    el.appendChild(arrow);

    el.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFolderDropdown(root, el, item);
    });
  } else {
    var img = document.createElement('img');
    img.src = getFaviconUrl(item.url);
    img.alt = '';
    img.loading = 'lazy';
    el.appendChild(img);

    var label2 = document.createElement('span');
    label2.textContent = item.title || 'Untitled';
    el.appendChild(label2);

    el.addEventListener('click', function(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        chrome.runtime.sendMessage({
          type: MSG.OPEN_BOOKMARK,
          payload: { url: item.url, newTab: true },
        });
      } else {
        window.location.href = item.url;
      }
    });

    el.addEventListener('auxclick', function(e) {
      if (e.button === 1) {
        e.preventDefault();
        chrome.runtime.sendMessage({
          type: MSG.OPEN_BOOKMARK,
          payload: { url: item.url, newTab: true },
        });
      }
    });
  }

  return el;
}

function resolveTheme(pref) {
  if (pref === 'dark') return 'dark';
  if (pref === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Width correction pass.
 * Measures actual rendered widths and bumps overflowing items to the next row.
 */
function correctOverflow(container, rows, settings) {
  var rowEls = container.querySelectorAll('.mrbb-row');
  var corrections = {};
  var needsCorrection = false;

  for (var ri = 0; ri < rowEls.length; ri++) {
    var rowEl = rowEls[ri];
    var rowWidth = rowEl.getBoundingClientRect().width - 16;
    var usedWidth = 0;
    var items = rowEl.querySelectorAll('.mrbb-item');

    for (var ii = 0; ii < items.length; ii++) {
      var itemEl = items[ii];
      var itemWidth = itemEl.getBoundingClientRect().width + DEFAULTS.ITEM_GAP;
      usedWidth += itemWidth;

      if (usedWidth > rowWidth && ri < rows.length - 1) {
        corrections[itemEl.dataset.id] = ri + 1;
        needsCorrection = true;
      } else {
        corrections[itemEl.dataset.id] = ri;
      }
    }
  }

  if (needsCorrection) {
    chrome.runtime.sendMessage({
      type: MSG.SAVE_ROW_ASSIGN,
      payload: corrections,
    });
  }
}
