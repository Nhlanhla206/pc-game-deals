# PC Game Deals — Technical Overview

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Markup (`index.html`) |
| Vanilla JavaScript (ES Modules) | Application logic, no framework |
| CSS3 | Styling (`css/style.css`) |
| CheapShark API | Live game deals & store data |
| ExchangeRate.fun API | USD → ZAR currency conversion |
| Web Storage (localStorage) | Theme preference & cached exchange rate |
| SVG | Icons and fallback graphics |

## External APIs & Endpoints

### CheapShark API — `https://www.cheapshark.com/api/1.0`
| Endpoint | Method | Description |
|---|---|---|
| `/stores` | GET | Store ID → store name mapping |
| `/deals` | GET | Current deals (params: `pageSize`, `sortBy`, `upperPrice`, `onSale=1`) |
| `https://www.cheapshark.com/redirect?dealID={id}` | GET | Redirect to a deal's store page |

### ExchangeRate.fun API — `https://api.exchangerate.fun`
| Endpoint | Method | Description |
|---|---|---|
| `/latest?base=USD` | GET | Latest USD → ZAR exchange rate |

### Steam Store (direct link)
- `https://store.steampowered.com/app/{steamAppID}`

## Functions Used

### `js/app.js`
- `init()` — bootstraps app, loads data, renders
- `loadData()` — parallel fetch of stores + deals
- `enrichDealsWithStoreNames(deals, stores)`
- `convertPrices(deals)` — converts USD prices to ZAR
- `handleApiFailure(err)` — falls back to static games
- `deriveStoresFromGames(games)`
- `showBanner(type, message, withRetry)`
- `createRetryButton()`
- `hideBanner()`
- `countGamesPerStore(deals)`
- `populateStoreFilters(stores, deals, selectedStoreId)`
- `createAllStoresOption(selectedStoreId)`
- `createStoreOption(id, name, count, selectedStoreId)`
- `applyFiltersAndRender()`
- `renderGames(games)`
- `updateResultsCount(games)`
- `updateSummary(games)`
- `toggleEmptyState(show)`
- `bindEvents()` and individual bind* helpers
- `resetFilters()`
- `restoreAllStoresRadio()`
- `showLoading(show)`
- `updateThemeIcon()`

### `js/services/cheapshark.js`
- `fetchStores()` — GET `/stores`
- `fetchDeals({ pageSize, sortBy, upperPrice })` — GET `/deals`
- `parsePrice(value)` (private)
- `normalizeDeal(raw)` (private)
- `getCheapSharkDealUrl(dealID)` — builds redirect URL

### `js/services/exchangeRate.js`
- `fetchUSDtoZARRate()` — GET `/latest?base=USD`
- `getUSDtoZARRate()` — cached rate getter (localStorage, 1h TTL)
- `convertUSDtoZAR(usdPrice, rate)` — price conversion

### `js/utils/calculations.js`
- `isOnSale(game)`
- `calculateDiscount(game)`
- `getGamesOnSale(games)`
- `findCheapestGame(games)`

### `js/utils/helpers.js`
- `formatPrice(price, currency)`
- `createEl(tag, attrs, children)`
- `debounce(fn, delay)`
- `safeUrl(url)`

### `js/utils/search.js`
- `searchGames(games, term)`

### `js/components/filters.js`
- `filterGames(games, filters)`
- `filterByDiscount(games, discount)` (private)
- `filterByStore(games, store)` (private)
- `filterByMinPrice(games, minPrice)` (private)
- `filterByMaxPrice(games, maxPrice)` (private)
- `sortGames(games, sortOption)`
- `discountPercent(game)` (private)

### `js/components/gameCards.js`
- `getStoreDealUrl(game)`
- `getDirectStoreLink(game)` (private)
- `getSteamDirectLink(game)` (private)
- `getCheapSharkFallbackUrl(game)` (private)
- `createImageSection(game)`
- `createPriceSection(game)`
- `createStoreSection(game)`
- `createRetailerLink(game)`
- `createGameCard(game)`
- `createFallbackIcon()` (private)

## Data Flow

1. `init()` → `loadData()` → `fetchStores()` + `fetchDeals()` (parallel)
2. Enrich deals with store names
3. `convertPrices()` → `getUSDtoZARRate()` (cached) → convert all prices to ZAR
4. On API failure → fall back to `fallbackGames` (`js/data/fallbackGames.js`)
5. `applyFiltersAndRender()` → search → filter → sort → render cards

## Configuration (`js/config/constants.js`)

- `API.CHEAPSHARK_BASE`, `API.EXCHANGE_RATE_BASE`
- `CURRENCY` (USD, ZAR), `THEME`, `VIEW_MODE`, `SORT_OPTION`, `FILTER`
- `DEBOUNCE_MS` (SEARCH: 200ms, PRICE: 300ms)
- `CACHE` (TTL: 1h, localStorage keys)
- `FETCH_DEFAULTS` (PAGE_SIZE: 60, SORT_BY: DealRating, UPPER_PRICE: 50)
- `DOM_ID` mapping for all element IDs
