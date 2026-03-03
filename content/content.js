(function() {
  'use strict';

  // Guard: don't inject twice (SPA navigations can re-trigger)
  if (document.getElementById('mrbb-host')) return;

  // --- Create Shadow DOM host ---
  var host = document.createElement('div');
  host.id = 'mrbb-host';
  host.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 100%',
    'z-index: 2147483647',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'line-height: 1',
    'pointer-events: auto',
  ].join(';');

  var shadow = host.attachShadow({ mode: 'closed' });

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = TOOLBAR_CSS;
  shadow.appendChild(style);

  // Toolbar container
  var toolbarRoot = document.createElement('div');
  toolbarRoot.id = 'mrbb-toolbar';
  shadow.appendChild(toolbarRoot);

  // Insert as first child of body
  document.body.prepend(host);

  // --- Page offset ---
  var currentMargin = 0;
  function updatePageOffset(totalHeight) {
    if (totalHeight !== currentMargin) {
      document.body.style.marginTop = totalHeight + 'px';
      currentMargin = totalHeight;
    }
  }

  // --- Request data from service worker ---
  function requestData() {
    chrome.runtime.sendMessage({ type: MSG.REQUEST_DATA }, function(response) {
      if (chrome.runtime.lastError) return; // Extension context invalidated
      if (response && response.payload) {
        renderToolbar(shadow, toolbarRoot, response.payload, updatePageOffset);
      }
    });
  }

  // Initial load
  requestData();

  // Listen for updates from service worker
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === MSG.TOOLBAR_DATA) {
      renderToolbar(shadow, toolbarRoot, message.payload, updatePageOffset);
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', function() {
    document.body.style.marginTop = '';
  });
})();
