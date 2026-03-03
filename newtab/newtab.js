(async function() {
  var container = document.getElementById('mrbb-toolbar');

  // On new tab, render toolbar directly (no shadow DOM — we own the page)
  chrome.runtime.sendMessage({ type: MSG.REQUEST_DATA }, function(response) {
    if (chrome.runtime.lastError) return;
    if (response && response.payload) {
      renderToolbar(document, container, response.payload, function(h) {
        container.style.height = h + 'px';
      });
    }
  });

  // Listen for live updates
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === MSG.TOOLBAR_DATA) {
      renderToolbar(document, container, message.payload, function(h) {
        container.style.height = h + 'px';
      });
    }
  });

  // Search bar
  document.getElementById('search').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var q = e.target.value.trim();
      if (!q) return;
      if (q.includes('.') && !q.includes(' ')) {
        window.location.href = q.startsWith('http') ? q : 'https://' + q;
      } else {
        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(q);
      }
    }
  });
})();
