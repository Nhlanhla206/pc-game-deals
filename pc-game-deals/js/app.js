import { fallbackGames } from './data/fallbackGames.js';
import { fetchDeals, fetchStores } from './services/cheapshark.js';
import { getUSDtoZARRate, convertUSDtoZAR } from './services/exchangeRate.js';
import { getGamesOnSale, findCheapestGame } from './utils/calculations.js';
import { searchGames } from './utils/search.js';
import { formatPrice, debounce, createEl } from './utils/helpers.js';
import { createGameCard } from './components/gameCards.js';
import { filterGames, sortGames } from './components/filters.js';
import {
  CURRENCY, THEME, VIEW_MODE, SORT_OPTION, FILTER,
  DEBOUNCE_MS, FETCH_DEFAULTS, DOM_ID,
} from './config/constants.js';

// ===================== STATE =====================
const state = {
  games: [],
  allGames: [],
  dataSource: 'loading',
  searchTerm: '',
  filters: {
    nav: FILTER.NAV_DISCOVER,
    discount: FILTER.DISCOUNT_ALL,
    store: null,
    minPrice: NaN,
    maxPrice: NaN,
  },
  sortOption: SORT_OPTION.DISCOUNT,
  viewMode: VIEW_MODE.GRID,
  theme: localStorage.getItem('theme') || THEME.DARK,
  stores: {},
  exchangeRate: null,
};

// ===================== DOM REFS =====================
const $ = id => document.getElementById(id);
const grid = $(DOM_ID.GAME_GRID);
const resultsCount = $(DOM_ID.RESULTS_COUNT);
const emptyState = $(DOM_ID.EMPTY_STATE);
const loadingState = $(DOM_ID.LOADING_STATE);
const statusBanner = $(DOM_ID.STATUS_BANNER);
const summarySection = $(DOM_ID.SUMMARY_SECTION);
const searchInput = $(DOM_ID.SEARCH_INPUT);
const clearSearchBtn = $(DOM_ID.CLEAR_SEARCH);
const sortSelect = $(DOM_ID.SORT_SELECT);
const sidebar = $(DOM_ID.SIDEBAR);
const sidebarToggle = $(DOM_ID.SIDEBAR_TOGGLE);
const themeToggle = $(DOM_ID.THEME_TOGGLE);
const storeOptions = $(DOM_ID.STORE_OPTIONS);

// ===================== INIT =====================
document.documentElement.dataset.theme = state.theme;
updateThemeIcon();
bindEvents();
init();

async function init() {
  showLoading(true);
  hideBanner();

  try {
    const [stores, deals] = await loadData();
    state.stores = stores;

    const enrichedDeals = enrichDealsWithStoreNames(deals, stores);
    const convertedDeals = await convertPrices(enrichedDeals);

    state.allGames = convertedDeals;
    state.dataSource = 'api';

    populateStoreFilters(stores, convertedDeals, state.filters.store);
  } catch (err) {
    handleApiFailure(err);
  }

  showLoading(false);
  applyFiltersAndRender();
}

async function loadData() {
  return Promise.all([
    fetchStores(),
    fetchDeals({
      pageSize: FETCH_DEFAULTS.PAGE_SIZE,
      sortBy: FETCH_DEFAULTS.SORT_BY,
      upperPrice: FETCH_DEFAULTS.UPPER_PRICE,
    }),
  ]);
}

function enrichDealsWithStoreNames(deals, stores) {
  return deals.map(d => ({
    ...d,
    store: stores[d.storeID] || `Store ${d.storeID}`,
  }));
}

async function convertPrices(deals) {
  try {
    const rate = await getUSDtoZARRate();
    const converted = deals.map(d => ({
      ...d,
      normalPrice: convertUSDtoZAR(d.normalPrice, rate),
      salePrice: convertUSDtoZAR(d.salePrice, rate),
      currency: CURRENCY.ZAR,
    }));
    state.exchangeRate = rate;
    updatePriceSectionTitle(CURRENCY.ZAR);
    return converted;
  } catch (err) {
    console.warn('Currency conversion failed:', err.message);
    const usdDeals = deals.map(d => ({ ...d, currency: CURRENCY.USD }));
    updatePriceSectionTitle(CURRENCY.USD);
    return usdDeals;
  }
}

function updatePriceSectionTitle(currency) {
  const title = document.getElementById('priceSectionTitle');
  if (title) title.textContent = `Price (${currency})`;
}

function handleApiFailure(err) {
  console.warn('CheapShark unavailable:', err.message);
  state.allGames = fallbackGames;
  state.dataSource = 'fallback';
  showBanner('error', 'Live deals unavailable. Showing fallback games.', true);
  // Derive store mapping from fallback games since API stores are unavailable
  const fallbackStores = deriveStoresFromGames(fallbackGames);
  state.stores = fallbackStores;
  populateStoreFilters(fallbackStores, fallbackGames, state.filters.store);
}

function deriveStoresFromGames(games) {
  const stores = {};
  games.forEach(g => {
    if (g.store) stores[g.storeID || g.store] = g.store;
  });
  return stores;
}

// ===================== BANNER =====================
function showBanner(type, message, withRetry = false) {
  statusBanner.hidden = false;
  statusBanner.className = `status-banner ${type}`;
  statusBanner.innerHTML = '';

  statusBanner.appendChild(createEl('span', { textContent: message }));

  if (withRetry) {
    statusBanner.appendChild(createRetryButton());
  }
}

function createRetryButton() {
  return createEl('button', {
    className: 'retry-btn',
    textContent: 'Retry',
    type: 'button',
    onclick: () => init(),
  });
}

function hideBanner() {
  statusBanner.hidden = true;
  statusBanner.innerHTML = '';
}

// ===================== FILTER POPULATION =====================
function countGamesPerStore(deals) {
  return deals.reduce((counts, d) => {
    const key = d.storeID || d.store;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function populateStoreFilters(stores, deals, selectedStoreId = null) {
  storeOptions.innerHTML = '';
  storeOptions.appendChild(createAllStoresOption(selectedStoreId));

  const storeCounts = countGamesPerStore(deals);

  // Build a complete store name mapping: use provided stores, fall back to deal data
  const storeNames = { ...stores };
  deals.forEach(d => {
    if (d.store && !storeNames[d.storeID] && !storeNames[d.store]) {
      storeNames[d.storeID || d.store] = d.store;
    }
  });

  Object.entries(storeNames).forEach(([id, name]) => {
    const count = storeCounts[id] || 0;
    if (count === 0) return;

    storeOptions.appendChild(createStoreOption(id, name, count, selectedStoreId));
  });
}

function createAllStoresOption(selectedStoreId) {
  const isSelected = selectedStoreId === null;
  const input = createEl('input', {
    type: 'radio',
    name: 'storeFilter',
    value: '',
    checked: isSelected,
    onclick: () => {
      state.filters.store = null;
      applyFiltersAndRender();
    },
  });
  return createEl('label', { className: 'store-option' }, [
    input,
    createEl('span', { textContent: 'All stores' }),
  ]);
}

function createStoreOption(id, name, count, selectedStoreId) {
  const isSelected = selectedStoreId === id;
  const input = createEl('input', {
    type: 'radio',
    name: 'storeFilter',
    value: id,
    checked: isSelected,
    onclick: () => {
      state.filters.store = id;
      applyFiltersAndRender();
    },
  });
  return createEl('label', { className: 'store-option' }, [
    input,
    createEl('span', { textContent: `${name} (${count})` }),
  ]);
}

// ===================== FILTERING & RENDERING =====================
function applyFiltersAndRender() {
  try {
    const searched = searchGames(state.allGames, state.searchTerm);

    // Count stores from games matching search + discount + price filters (store excluded)
    const storeCountBase = filterGames(searched, {
      ...state.filters,
      store: null,
    });
    populateStoreFilters(state.stores, storeCountBase, state.filters.store);

    // Apply all filters including store for actual rendering
    const filtered = filterGames(searched, state.filters);
    state.games = sortGames(filtered, state.sortOption);

    renderGames(state.games);
    updateResultsCount(state.games);
    updateSummary(state.games);
    toggleEmptyState(state.games.length === 0);
  } catch (err) {
    console.error('applyFiltersAndRender failed:', err);
  }
}

function renderGames(games) {
  grid.innerHTML = '';
  grid.classList.toggle('list-view', state.viewMode === 'list');

  if (!games.length) return;

  const fragment = document.createDocumentFragment();
  games.forEach(g => fragment.appendChild(createGameCard(g)));
  grid.appendChild(fragment);
}

function updateResultsCount(games) {
  const n = games.length;
  resultsCount.textContent = `${n} deal${n !== 1 ? 's' : ''} found`;
}

function updateSummary(games) {
  if (!games.length) {
    summarySection.innerHTML = '';
    return;
  }

  const cheapest = findCheapestGame(games);
  const saleCount = getGamesOnSale(games).length;
  const currency = games[0].currency;

  summarySection.innerHTML = '';

  if (cheapest) {
    const span = createEl('span');
    span.innerHTML = `Cheapest: <span class="summary-highlight">${cheapest.title}</span> — ${formatPrice(cheapest.salePrice, cheapest.currency)}`;
    summarySection.appendChild(span);
  }

  summarySection.appendChild(createEl('span', {
    textContent: `On sale: ${saleCount} / ${games.length}`,
  }));

  summarySection.appendChild(createEl('span', {
    textContent: `Currency: ${currency}`,
  }));
}

function toggleEmptyState(show) {
  emptyState.hidden = !show;
  grid.hidden = show;
}

// ===================== SEARCH =====================
const debouncedSearch = debounce(term => {
  state.searchTerm = term;
  clearSearchBtn.hidden = !term;
  applyFiltersAndRender();
}, DEBOUNCE_MS.SEARCH);

function bindEvents() {
  bindSearchEvents();
  bindSortEvents();
  bindViewToggleEvents();
  bindThemeEvents();
  bindNavEvents();
  bindDiscountEvents();
  bindPriceRangeEvents();
  bindSidebarEvents();
  bindResetEvents();
}

function bindSearchEvents() {
  searchInput.addEventListener('input', e => {
    debouncedSearch(e.target.value);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchTerm = '';
    clearSearchBtn.hidden = true;
    applyFiltersAndRender();
    searchInput.focus();
  });
}

function bindSortEvents() {
  sortSelect.addEventListener('change', e => {
    state.sortOption = e.target.value;
    applyFiltersAndRender();
  });
}

function bindViewToggleEvents() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.viewMode = btn.dataset.view;
      toggleActiveButton(document.querySelectorAll('.view-btn'), btn);
      applyFiltersAndRender();
    });
  });
}

function bindThemeEvents() {
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
  });
}

function bindNavEvents() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleActiveButton(document.querySelectorAll('.nav-item'), btn);
      state.filters.nav = btn.dataset.nav;
      applyFiltersAndRender();
    });
  });
}

function bindDiscountEvents() {
  document.querySelectorAll('input[name="discount"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.filters.discount = radio.value;
      applyFiltersAndRender();
    });
  });
}

function bindPriceRangeEvents() {
  $(DOM_ID.MIN_PRICE).addEventListener('input', debounce(e => {
    state.filters.minPrice = parseFloat(e.target.value);
    applyFiltersAndRender();
  }, DEBOUNCE_MS.PRICE));

  $(DOM_ID.MAX_PRICE).addEventListener('input', debounce(e => {
    state.filters.maxPrice = parseFloat(e.target.value);
    applyFiltersAndRender();
  }, DEBOUNCE_MS.PRICE));
}

function bindSidebarEvents() {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (window.innerWidth <= 768
      && sidebar.classList.contains('open')
      && !sidebar.contains(e.target)
      && e.target !== sidebarToggle) {
      sidebar.classList.remove('open');
    }
  });
}

function bindResetEvents() {
  $(DOM_ID.RESET_FILTERS).addEventListener('click', resetFilters);
}

function toggleActiveButton(buttons, activeBtn) {
  buttons.forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

function resetFilters() {
  state.searchTerm = '';
  searchInput.value = '';
  clearSearchBtn.hidden = true;

  state.filters = {
    nav: FILTER.NAV_DISCOVER,
    discount: FILTER.DISCOUNT_ALL,
    store: null,
    minPrice: NaN,
    maxPrice: NaN,
  };

  state.sortOption = SORT_OPTION.DISCOUNT;
  sortSelect.value = SORT_OPTION.DISCOUNT;

  $(DOM_ID.MIN_PRICE).value = '';
  $(DOM_ID.MAX_PRICE).value = '';

  document.querySelectorAll('input[name="discount"]').forEach(r => {
    r.checked = r.value === FILTER.DISCOUNT_ALL;
  });

  document.querySelectorAll('.nav-item').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  restoreAllStoresRadio();
  applyFiltersAndRender();
}

function restoreAllStoresRadio() {
  const radio = storeOptions.querySelector('input[value=""]');
  if (radio) radio.checked = true;
}

// ===================== UTILITY =====================
function showLoading(show) {
  loadingState.hidden = !show;
  if (show) grid.innerHTML = '';
}

function updateThemeIcon() {
  const moon = themeToggle.querySelector('.theme-icon-moon');
  const sun = themeToggle.querySelector('.theme-icon-sun');
  const isDark = state.theme === THEME.DARK;

  moon.classList.toggle('active', isDark);
  sun.classList.toggle('active', !isDark);
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light theme' : 'Switch to dark theme'
  );
}