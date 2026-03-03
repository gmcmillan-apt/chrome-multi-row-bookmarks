const OVERFLOW_DEFAULTS = {
  FAVICON_SIZE: 16,
  ITEM_PADDING: 6,
  ITEM_GAP: 2,
  MAX_LABEL_WIDTH: 150,
  ROW_COUNT: 2,
};

/**
 * Compute row assignments for all bookmarks.
 *
 * Strategy:
 * 1. Manually-assigned bookmarks (from drag-drop) go to their assigned row.
 * 2. Unassigned bookmarks fill rows left-to-right, top-to-bottom via width estimation.
 * 3. Content script does a correction pass with real pixel measurements after render.
 *
 * @param {{tree: Array}} bookmarks
 * @param {Object} rowAssignments - { bookmarkId: rowIndex }
 * @param {Object} settings
 * @returns {{ rows: Array[], settings: Object }}
 */
export function computeOverflow(bookmarks, rowAssignments, settings) {
  const { tree } = bookmarks;
  const rowCount = settings.rowCount || OVERFLOW_DEFAULTS.ROW_COUNT;

  const assigned = [];
  const unassigned = [];

  for (const node of tree) {
    if (rowAssignments[node.id] !== undefined) {
      assigned.push({ ...node, row: rowAssignments[node.id] });
    } else {
      unassigned.push(node);
    }
  }

  // Initialize rows
  const rows = Array.from({ length: rowCount }, () => []);
  const rowWidths = new Array(rowCount).fill(0);
  const availableWidth = 1400; // Conservative estimate; content script corrects

  // Place manually-assigned items first
  for (const item of assigned) {
    const row = Math.min(item.row, rowCount - 1);
    rows[row].push(item);
    rowWidths[row] += estimateWidth(item.title);
  }

  // Fill unassigned items into rows with available space
  for (const item of unassigned) {
    let placed = false;
    for (let r = 0; r < rowCount; r++) {
      const itemWidth = estimateWidth(item.title);
      if (rowWidths[r] + itemWidth <= availableWidth) {
        rows[r].push(item);
        rowWidths[r] += itemWidth;
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows[rowCount - 1].push(item);
    }
  }

  return { rows, settings };
}

function estimateWidth(title) {
  const charWidth = 7.5;
  const textWidth = Math.min((title || '').length * charWidth, OVERFLOW_DEFAULTS.MAX_LABEL_WIDTH);
  return OVERFLOW_DEFAULTS.FAVICON_SIZE + 4 + textWidth + OVERFLOW_DEFAULTS.ITEM_PADDING * 2 + OVERFLOW_DEFAULTS.ITEM_GAP;
}
