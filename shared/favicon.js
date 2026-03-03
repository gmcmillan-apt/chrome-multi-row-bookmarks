/**
 * Build favicon URL using Google's public favicon service.
 * @param {string} url - The bookmark URL
 * @param {number} [size=16] - Icon size in px
 * @returns {string} Favicon image URL
 */
function getFaviconUrl(url, size) {
  size = size || DEFAULTS.FAVICON_SIZE;
  try {
    var domain = new URL(url).hostname;
    return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=' + size;
  } catch (e) {
    return 'https://www.google.com/s2/favicons?domain=example.com&sz=' + size;
  }
}
