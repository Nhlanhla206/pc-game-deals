/**
 * Application-wide constants.
 * Centralizes magic numbers, strings, and configuration values.
 */

export const API = {
  CHEAPSHARK_BASE: 'https://www.cheapshark.com/api/1.0',
  EXCHANGE_RATE_BASE: 'https://api.exchangerate.fun',
};

export const CURRENCY = {
  USD: 'USD',
  ZAR: 'ZAR',
};

export const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const VIEW_MODE = {
  GRID: 'grid',
  LIST: 'list',
};

export const SORT_OPTION = {
  DISCOUNT: 'discount',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  TITLE: 'title',
};

export const DEBOUNCE_MS = {
  SEARCH: 200,
  PRICE: 300,
};

export const CACHE = {
  TTL_MS: 3600000, // 1 hour
  KEY_RATE: 'usd_to_zar_rate',
  KEY_TIME: 'usd_to_zar_rate_time',
};

export const FETCH_DEFAULTS = {
  PAGE_SIZE: 60,
  SORT_BY: 'DealRating',
  UPPER_PRICE: 50,
};

export const FILTER = {
  DISCOUNT_ALL: 'all',
  DISCOUNT_SALE: 'sale',
  DISCOUNT_NONE: 'none',
};

export const DOM_ID = {
  GAME_GRID: 'gameGrid',
  RESULTS_COUNT: 'resultsCount',
  EMPTY_STATE: 'emptyState',
  LOADING_STATE: 'loadingState',
  STATUS_BANNER: 'statusBanner',
  SUMMARY_SECTION: 'summarySection',
  SEARCH_INPUT: 'searchInput',
  CLEAR_SEARCH: 'clearSearch',
  SORT_SELECT: 'sortSelect',
  SIDEBAR: 'sidebar',
  SIDEBAR_TOGGLE: 'sidebarToggle',
  THEME_TOGGLE: 'themeToggle',
  STORE_OPTIONS: 'storeOptions',
  MIN_PRICE: 'minPrice',
  MAX_PRICE: 'maxPrice',
  RESET_FILTERS: 'resetFiltersBtn',
};