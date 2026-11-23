import { CURRENCY } from '../config/constants.js';

/**
 * Format price as currency string.
 * @param {number} price
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatPrice(price, currency = CURRENCY.USD) {
  if (!Number.isFinite(price)) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

/**
 * Create a DOM element with attributes and optional child nodes.
 * @param {string} tag - HTML tag name
 * @param {object} [attrs] - key/value attributes. 'className', 'textContent', 'innerHTML' handled specially.
 * @param {Node|Node[]|string} [children] - child nodes or text to append
 * @returns {HTMLElement}
 */
export function createEl(tag, attrs = {}, children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key === 'textContent') el.textContent = value;
    else if (key === 'innerHTML') el.innerHTML = value;
    else el.setAttribute(key, value);
  }
  if (children) {
    const childList = Array.isArray(children) ? children : [children];
    childList.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else el.appendChild(child);
    });
  }
  return el;
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} [delay=DEBOUNCE_MS.SEARCH]
 * @returns {Function}
 */
export function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Validate URL is safe to use as href.
 * @param {string} url
 * @returns {string|null}
 */
export function safeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url, location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}