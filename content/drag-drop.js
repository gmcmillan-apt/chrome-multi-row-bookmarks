var draggedItem = null;
var draggedId = null;

function setupDraggable(el, item) {
  el.addEventListener('dragstart', function(e) {
    draggedItem = item;
    draggedId = item.id;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  });

  el.addEventListener('dragend', function() {
    el.classList.remove('dragging');
    draggedItem = null;
    draggedId = null;
    // Remove all drag-over highlights from shadow root
    var host = el.closest('#mrbb-toolbar') || el.getRootNode();
    if (host && host.querySelectorAll) {
      var overs = host.querySelectorAll('.mrbb-row.drag-over');
      for (var i = 0; i < overs.length; i++) {
        overs[i].classList.remove('drag-over');
      }
    }
  });
}

function setupRowDropTarget(rowEl, rowIndex) {
  rowEl.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    rowEl.classList.add('drag-over');
  });

  rowEl.addEventListener('dragleave', function() {
    rowEl.classList.remove('drag-over');
  });

  rowEl.addEventListener('drop', function(e) {
    e.preventDefault();
    rowEl.classList.remove('drag-over');

    var bookmarkId = e.dataTransfer.getData('text/plain');
    if (!bookmarkId) return;

    saveDropResult(bookmarkId, rowIndex, rowEl);
  });
}

function saveDropResult(bookmarkId, targetRow, rowEl) {
  // Build assignments from current DOM state
  var toolbar = rowEl.closest('#mrbb-toolbar') || rowEl.parentElement;
  var allRows = toolbar.querySelectorAll('.mrbb-row');
  var assignments = {};

  for (var ri = 0; ri < allRows.length; ri++) {
    var items = allRows[ri].querySelectorAll('.mrbb-item');
    for (var ii = 0; ii < items.length; ii++) {
      var id = items[ii].dataset.id;
      if (id !== bookmarkId) {
        assignments[id] = ri;
      }
    }
  }

  // Place the dragged item at the target row
  assignments[bookmarkId] = targetRow;

  chrome.runtime.sendMessage({
    type: MSG.SAVE_ROW_ASSIGN,
    payload: assignments,
  });
}
