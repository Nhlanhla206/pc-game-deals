/**
 * CheapShark API service module.
 * Docs: https://apidocs.cheapshark.com/
 * All prices are in USD.
 */

import { API, CURRENCY, FETCH_DEFAULTS } from '../config/constants.js';

const BASE_URL = API.CHEAPSHARK_BASE;

/**
 * Get storeID → storeName mapping.
 * @returns {Promise<Record<string, string>>}
 */
export async function fetchStores() {
  const res = await fetch(`${BASE_URL}/stores`);
  if (!res.ok) throw new Error(`Stores request failed: HTTP ${res.status}`);
  const stores = await res.json();
  if (!Array.isArray(stores)) throw new Error('Malformed stores response');
  return stores.reduce((map, store) => {
    map[store.storeID] = store.storeName;
    return map;
  }, {});
}

/**
 * Get current deals list.
 * @param {object} [options]
 * @param {number} [options.pageSize=FETCH_DEFAULTS.PAGE_SIZE]
 * @param {string} [options.sortBy=FETCH_DEFAULTS.SORT_BY]
 * @param {number} [options.upperPrice=FETCH_DEFAULTS.UPPER_PRICE]
 * @returns {Promise<Array>} Normalized deal array
 */
export async function fetchDeals({
  pageSize = FETCH_DEFAULTS.PAGE_SIZE,
  sortBy = FETCH_DEFAULTS.SORT_BY,
  upperPrice = FETCH_DEFAULTS.UPPER_PRICE,
} = {}) {
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    sortBy,
    upperPrice: String(upperPrice),
    onSale: '1',
  });

  const res = await fetch(`${BASE_URL}/deals?${params.toString()}`);

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || '30';
    throw new Error(`Rate limited. Try again in ${retryAfter}s.`);
  }

  if (!res.ok) throw new Error(`Deals request failed: HTTP ${res.status}`);

  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error('Malformed deals response');

  return raw.map(normalizeDeal).filter(Boolean);
}

/**
 * Parse price string to finite number.
 * @param {string|number} value
 * @returns {number|null}
 */
function parsePrice(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Normalize CheapShark deal to app internal model.
 * @param {object} raw
 * @returns {object|null}
 */
function normalizeDeal(raw) {
  if (!raw || !raw.dealID || !raw.title) return null;

  const normalPrice = parsePrice(raw.normalPrice);
  const salePrice = parsePrice(raw.salePrice);
  if (normalPrice === null || salePrice === null) return null;

  return {
    id: `cs-${raw.dealID}`,
    title: raw.title,
    normalPrice,
    salePrice,
    currency: CURRENCY.USD,
    storeID: raw.storeID,
    store: null,
    source: 'cheapshark',
    dealID: raw.dealID,
    thumb: raw.thumb || null,
    savings: raw.savings ? parseFloat(raw.savings) : null,
    isOnSale: raw.isOnSale === '1',
    externalLinks: raw.externalLinks || null,
    steamAppID: raw.steamAppID || null,
  };
}

/**
 * Generate CheapShark redirect URL.
 * @param {string} dealID
 * @returns {string|null}
 */
export function getCheapSharkDealUrl(dealID) {
  if (!dealID || typeof dealID !== 'string') return null;
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
}