/**
 * Read the Bookmarks Bar folder and return a tree structure.
 * @returns {Promise<{tree: Array}>}
 */
export async function readBookmarksBar() {
  const children = await chrome.bookmarks.getChildren(BOOKMARKS_BAR_ID);

  const tree = await Promise.all(children.map(async (node) => {
    if (node.url) {
      return {
        id: node.id,
        title: node.title,
        url: node.url,
        isFolder: false,
        favicon: getFaviconUrl(node.url),
      };
    } else {
      const folderChildren = await readFolderRecursive(node.id);
      return {
        id: node.id,
        title: node.title,
        isFolder: true,
        children: folderChildren,
      };
    }
  }));

  return { tree };
}

async function readFolderRecursive(folderId) {
  const children = await chrome.bookmarks.getChildren(folderId);
  return Promise.all(children.map(async (node) => {
    if (node.url) {
      return {
        id: node.id,
        title: node.title,
        url: node.url,
        isFolder: false,
        favicon: getFaviconUrl(node.url),
      };
    } else {
      return {
        id: node.id,
        title: node.title,
        isFolder: true,
        children: await readFolderRecursive(node.id),
      };
    }
  }));
}
