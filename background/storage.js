const STORAGE_KEYS_BG = {
  ROW_ASSIGNMENTS: 'rowAssignments',
  SETTINGS: 'settings',
};

const DEFAULTS_BG = {
  ROW_COUNT: 2,
  ROW_HEIGHT: 28,
  THEME: 'system',
};

export async function loadSettings() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS_BG.SETTINGS);
  return {
    rowCount: DEFAULTS_BG.ROW_COUNT,
    rowHeight: DEFAULTS_BG.ROW_HEIGHT,
    theme: DEFAULTS_BG.THEME,
    ...result[STORAGE_KEYS_BG.SETTINGS],
  };
}

export async function saveSettings(settings) {
  await chrome.storage.sync.set({ [STORAGE_KEYS_BG.SETTINGS]: settings });
}

export async function loadRowAssignments() {
  const result = await chrome.storage.sync.get(STORAGE_KEYS_BG.ROW_ASSIGNMENTS);
  return result[STORAGE_KEYS_BG.ROW_ASSIGNMENTS] || {};
}

export async function saveRowAssignments(assignments) {
  await chrome.storage.sync.set({ [STORAGE_KEYS_BG.ROW_ASSIGNMENTS]: assignments });
}
