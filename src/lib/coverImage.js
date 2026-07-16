// Open Library cover URLs end in -S/-M/-L.jpg for small/medium/large.
// Swaps to a smaller size for thumbnails so the grid doesn't download full-size images
// it doesn't need. Non-Open-Library URLs are returned unchanged.
function coverUrlForSize(url, size) {
  if (!url) return url;
  return url.replace(/-[SML]\.jpg$/i, `-${size}.jpg`);
}

module.exports = { coverUrlForSize };
