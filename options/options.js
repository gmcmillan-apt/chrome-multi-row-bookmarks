document.addEventListener('DOMContentLoaded', async function() {
  var result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  var settings = Object.assign({
    rowCount: DEFAULTS.ROW_COUNT,
    rowHeight: DEFAULTS.ROW_HEIGHT,
    theme: DEFAULTS.THEME,
  }, result[STORAGE_KEYS.SETTINGS]);

  var rowCountInput = document.getElementById('rowCount');
  var rowHeightInput = document.getElementById('rowHeight');
  var themeSelect = document.getElementById('theme');

  rowCountInput.value = settings.rowCount;
  document.getElementById('rowCountValue').textContent = settings.rowCount;
  rowHeightInput.value = settings.rowHeight;
  document.getElementById('rowHeightValue').textContent = settings.rowHeight;
  themeSelect.value = settings.theme;

  rowCountInput.addEventListener('input', function() {
    document.getElementById('rowCountValue').textContent = rowCountInput.value;
    saveAndNotify();
  });

  rowHeightInput.addEventListener('input', function() {
    document.getElementById('rowHeightValue').textContent = rowHeightInput.value;
    saveAndNotify();
  });

  themeSelect.addEventListener('change', saveAndNotify);

  document.getElementById('resetRows').addEventListener('click', async function() {
    await chrome.storage.sync.remove(STORAGE_KEYS.ROW_ASSIGNMENTS);
    chrome.runtime.sendMessage({ type: MSG.SETTINGS_CHANGED });
    alert('Row assignments reset. Bookmarks will auto-overflow.');
  });

  async function saveAndNotify() {
    var newSettings = {
      rowCount: parseInt(rowCountInput.value),
      rowHeight: parseInt(rowHeightInput.value),
      theme: themeSelect.value,
    };
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: newSettings });
    chrome.runtime.sendMessage({ type: MSG.SETTINGS_CHANGED });
  }
});
