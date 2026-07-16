function matchesQuery(title, q) {
  if (!q) return true;
  return title.toLowerCase().includes(q.toLowerCase());
}

module.exports = { matchesQuery };
