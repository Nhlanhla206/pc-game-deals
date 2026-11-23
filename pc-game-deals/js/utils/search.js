/**
 * Search games by title (case-insensitive, partial match).
 * @param {Array} games
 * @param {string} term
 * @returns {Array}
 */
export function searchGames(games, term) {
  if (!Array.isArray(games)) return [];
  const q = String(term ?? '').trim().toLowerCase();
  if (!q) return games;
  return games.filter(g => g.title.toLowerCase().includes(q));
}