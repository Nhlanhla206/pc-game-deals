/**
 * ExchangeRate.fun service — USD to ZAR conversion.
 * No API key required. Rates updated hourly.
 * Docs: https://www.exchangerate.fun/docs/#endpoint
 */

import { API, CURRENCY, CACHE } from '../config/constants.js';

const BASE_URL = API.EXCHANGE_RATE_BASE;

/**
 * Fetch the latest USD→ZAR exchange rate.
 * @returns {Promise<number>} ZAR per 1 USD
 */
export async function fetchUSDtoZARRate() {
  const res = await fetch(`${BASE_URL}/latest?base=${CURRENCY.USD}`);
  if (!res.ok) throw new Error(`Exchange rate request failed: HTTP ${res.status}`);
  const data = await res.json();
  if (!data.rates || typeof data.rates.ZAR !== 'number') {
    throw new Error('ZAR rate not found in exchange rate response');
  }
  return data.rates.ZAR;
}

/**
 * Get the USD→ZAR rate, using a time-based cache to avoid unnecessary requests.
 * Falls back to cached value if the network request fails.
 * @returns {Promise<number>}
 */
export async function getUSDtoZARRate() {
  const now = Date.now();
  const cachedRate = localStorage.getItem(CACHE.KEY_RATE);
  const cachedTime = localStorage.getItem(CACHE.KEY_TIME);

  if (cachedRate && cachedTime && now - parseInt(cachedTime, 10) < CACHE.TTL_MS) {
    return parseFloat(cachedRate);
  }

  try {
    const rate = await fetchUSDtoZARRate();
    localStorage.setItem(CACHE.KEY_RATE, rate.toString());
    localStorage.setItem(CACHE.KEY_TIME, now.toString());
    return rate;
  } catch (err) {
    console.warn('Failed to fetch exchange rate:', err.message);
    if (cachedRate) return parseFloat(cachedRate);
    throw err;
  }
}

/**
 * Convert a price from USD to ZAR using the given rate.
 * @param {number} usdPrice
 * @param {number} rate
 * @returns {number}
 */
export function convertUSDtoZAR(usdPrice, rate) {
  return usdPrice * rate;
}
