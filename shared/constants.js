// Message types between service worker and content scripts
const MSG = {
  // Service worker -> Content script
  TOOLBAR_DATA:     'toolbar:data',
  // Content script -> Service worker
  REQUEST_DATA:     'request:data',
  SAVE_ROW_ASSIGN:  'save:rowAssign',
  OPEN_BOOKMARK:    'open:bookmark',
  // Options -> Service worker
  SETTINGS_CHANGED: 'settings:changed',
};

// Storage keys
const STORAGE_KEYS = {
  ROW_ASSIGNMENTS: 'rowAssignments',
  SETTINGS: 'settings',
};

// Defaults
const DEFAULTS = {
  ROW_COUNT: 2,
  ROW_HEIGHT: 28,
  THEME: 'system',
  FAVICON_SIZE: 16,
  ITEM_PADDING: 6,
  ITEM_GAP: 2,
  FONT_SIZE: 13,
  MAX_LABEL_WIDTH: 150,
};

// Bookmarks Bar folder ID is always "1" in Chrome
const BOOKMARKS_BAR_ID = '1';
