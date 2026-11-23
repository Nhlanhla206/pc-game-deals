/**
 * Check if game is on sale (salePrice < normalPrice).
 * @param {object} game
 * @returns {boolean}
 */
export function isOnSale(game) {
  return Number.isFinite(game.normalPrice) &&
         Number.isFinite(game.salePrice) &&
         game.salePrice < game.normalPrice;
}

/**
 * Calculate discount percentage.
 * @param {object} game
 * @returns {number} Integer discount 0–100, returns 0 if invalid
 */
export function calculateDiscount(game) {
  const { normalPrice, salePrice } = game;
  if (!Number.isFinite(normalPrice) || normalPrice <= 0) return 0;
  if (!Number.isFinite(salePrice)) return 0;
  return Math.round(((normalPrice - salePrice) / normalPrice) * 100);
}

/**
 * Return all games on sale.
 * @param {Array} games
 * @returns {Array}
 */
export function getGamesOnSale(games) {
  if (!Array.isArray(games)) return [];
  return games.filter(isOnSale);
}

/**
 * Find cheapest game.
 * @param {Array} games
 * @returns {object|null}
 */
export function findCheapestGame(games) {
  if (!Array.isArray(games) || games.length === 0) return null;
  return games.reduce((cheapest, game) =>
    game.salePrice < cheapest.salePrice ? game : cheapest
  );
}