import { isOnSale } from '../utils/calculations.js';
import { FILTER, SORT_OPTION } from '../config/constants.js';

export function filterGames(games, filters) {
  let result = games;

  result = filterByDiscount(result, filters.discount);
  result = filterByStore(result, filters.store);
  result = filterByMinPrice(result, filters.minPrice);
  result = filterByMaxPrice(result, filters.maxPrice);

  return result;
}

function filterByDiscount(games, discount) {
  if (discount === FILTER.DISCOUNT_SALE) return games.filter(isOnSale);
  if (discount === FILTER.DISCOUNT_NONE) return games.filter(g => !isOnSale(g));
  return games;
}

function filterByStore(games, store) {
  if (!store) return games;
  return games.filter(g => g.storeID === store || g.store === store);
}

function filterByMinPrice(games, minPrice) {
  if (!Number.isFinite(minPrice)) return games;
  return games.filter(g => g.salePrice >= minPrice);
}

function filterByMaxPrice(games, maxPrice) {
  if (!Number.isFinite(maxPrice)) return games;
  return games.filter(g => g.salePrice <= maxPrice);
}

export function sortGames(games, sortOption) {
  const copy = [...games];

  const comparators = {
    [SORT_OPTION.PRICE_ASC]: (a, b) => a.salePrice - b.salePrice,
    [SORT_OPTION.PRICE_DESC]: (a, b) => b.salePrice - a.salePrice,
    [SORT_OPTION.DISCOUNT]: (a, b) => discountPercent(b) - discountPercent(a),
    [SORT_OPTION.TITLE]: (a, b) => a.title.localeCompare(b.title),
  };

  const comparator = comparators[sortOption];
  if (!comparator) return copy;

  return copy.sort(comparator);
}

function discountPercent(game) {
  if (!game.normalPrice || game.normalPrice <= 0) return 0;
  return ((game.normalPrice - game.salePrice) / game.normalPrice) * 100;
}