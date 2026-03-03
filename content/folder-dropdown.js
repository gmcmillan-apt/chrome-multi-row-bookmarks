var activeDropdown = null;

function toggleFolderDropdown(root, anchorEl, folderItem) {
  if (activeDropdown && activeDropdown.dataset.folderId === folderItem.id) {
    closeFolderDropdown(root);
    return;
  }

  closeFolderDropdown(root);

  var dropdown = document.createElement('div');
  dropdown.className = 'mrbb-dropdown';
  dropdown.dataset.folderId = folderItem.id;

  var rect = anchorEl.getBoundingClientRect();
  dropdown.style.top = rect.bottom + 'px';
  dropdown.style.left = rect.left + 'px';

  if (folderItem.children && folderItem.children.length > 0) {
    for (var i = 0; i < folderItem.children.length; i++) {
      dropdown.appendChild(createDropdownItem(root, folderItem.children[i]));
    }
  } else {
    var empty = document.createElement('div');
    empty.className = 'mrbb-dropdown-item';
    empty.style.color = '#999';
    empty.textContent = '(empty)';
    dropdown.appendChild(empty);
  }

  // Append to the root (shadow root or document)
  var appendTarget = root.getElementById ? root.getElementById('mrbb-toolbar') : root.querySelector('#mrbb-toolbar');
  if (appendTarget) {
    appendTarget.appendChild(dropdown);
  } else {
    root.appendChild(dropdown);
  }
  activeDropdown = dropdown;

  // Close on click outside
  setTimeout(function() {
    var closeHandler = function(e) {
      if (!dropdown.contains(e.target) && e.target !== anchorEl && !anchorEl.contains(e.target)) {
        closeFolderDropdown(root);
        root.removeEventListener('click', closeHandler);
      }
    };
    root.addEventListener('click', closeHandler);
  }, 0);

  // Also close on page click (outside shadow)
  document.addEventListener('click', function handler() {
    closeFolderDropdown(root);
    document.removeEventListener('click', handler);
  }, { once: true });
}

function createDropdownItem(root, item) {
  var el = document.createElement('div');
  el.className = 'mrbb-dropdown-item';

  if (item.isFolder) {
    var icon = document.createElement('span');
    icon.textContent = '\uD83D\uDCC1';
    el.appendChild(icon);

    var label = document.createElement('span');
    label.textContent = item.title || 'Untitled';
    el.appendChild(label);

    var arrow = document.createElement('span');
    arrow.className = 'mrbb-subfolder-arrow';
    arrow.textContent = '\u25B8';
    el.appendChild(arrow);

    el.addEventListener('click', function(e) {
      e.stopPropagation();
      expandSubfolder(el, item, root);
    });
  } else {
    var img = document.createElement('img');
    img.src = getFaviconUrl(item.url);
    img.alt = '';
    el.appendChild(img);

    var label2 = document.createElement('span');
    label2.textContent = item.title || 'Untitled';
    el.appendChild(label2);

    el.addEventListener('click', function() {
      window.location.href = item.url;
      closeFolderDropdown(root);
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

function expandSubfolder(parentEl, folderItem, root) {
  var existing = parentEl.nextElementSibling;
  if (existing && existing.classList.contains('mrbb-subfolder-group')) {
    existing.remove();
    return;
  }

  var group = document.createElement('div');
  group.className = 'mrbb-subfolder-group';

  if (folderItem.children) {
    for (var i = 0; i < folderItem.children.length; i++) {
      group.appendChild(createDropdownItem(root, folderItem.children[i]));
    }
  }

  parentEl.after(group);
}

function closeFolderDropdown(root) {
  if (activeDropdown) {
    activeDropdown.remove();
    activeDropdown = null;
  }
}
