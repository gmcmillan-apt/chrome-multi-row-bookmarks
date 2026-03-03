import { readBookmarksBar } from './bookmarks.js';
import { loadSettings, loadRowAssignments, saveRowAssignments } from './storage.js';
import { computeOverflow } from './overflow.js';
import { broadcastToAllTabs } from './messaging.js';

// --- Debounced refresh ---
let refreshTimeout = null;
function debouncedRefresh() {
  clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(refreshAndBroadcast, 300);
}

// --- Initialization ---
chrome.runtime.onInstalled.addListener(async () => {
  await refreshAndBroadcast();
});

// --- Message handler ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'request:data':
      handleRequestData().then(sendResponse);
      return true; // async

    case 'save:rowAssign':
      handleSaveRowAssign(message.payload).then(sendResponse);
      return true;

    case 'open:bookmark':
      handleOpenBookmark(message.payload, sender.tab);
      break;

    case 'settings:changed':
      refreshAndBroadcast();
      break;
  }
});

// --- Bookmark change listeners (debounced) ---
chrome.bookmarks.onCreated.addListener(debouncedRefresh);
chrome.bookmarks.onRemoved.addListener(debouncedRefresh);
chrome.bookmarks.onMoved.addListener(debouncedRefresh);
chrome.bookmarks.onChanged.addListener(debouncedRefresh);

// --- Core functions ---

async function refreshAndBroadcast() {
  const bookmarks = await readBookmarksBar();
  const settings = await loadSettings();
  const rowAssignments = await loadRowAssignments();
  const toolbarData = computeOverflow(bookmarks, rowAssignments, settings);

  broadcastToAllTabs({
    type: 'toolbar:data',
    payload: toolbarData,
  });
}

async function handleRequestData() {
  const bookmarks = await readBookmarksBar();
  const settings = await loadSettings();
  const rowAssignments = await loadRowAssignments();
  const toolbarData = computeOverflow(bookmarks, rowAssignments, settings);
  return { type: 'toolbar:data', payload: toolbarData };
}

async function handleSaveRowAssign(assignments) {
  await saveRowAssignments(assignments);
  await refreshAndBroadcast();
  return { success: true };
}

function handleOpenBookmark(payload, senderTab) {
  if (payload.newTab) {
    chrome.tabs.create({ url: payload.url, active: false });
  } else if (senderTab) {
    chrome.tabs.update(senderTab.id, { url: payload.url });
  }
}
