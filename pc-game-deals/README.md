# PC Game Deals — README

A vanilla JavaScript web app that pulls live discounted PC games from the CheapShark API, converts USD prices to ZAR via ExchangeRate.fun, and lets users search, filter, sort and jump to the retailer. No frameworks, no build step.

---

## Features

- **Live deals** from CheapShark, refreshed on every page load
- **USD → ZAR conversion** using a live exchange rate
- **Search** by title (case-insensitive, partial match)
- **Filter** by store and by discount status
- **Sort** by price, discount percentage or title
- **Grid / list view** toggle
- **Dark / light theme** (saved to `localStorage`)
- **Direct retailer links** — Steam product pages when a Steam App ID is available, CheapShark redirect otherwise
- **Fallback dataset** of local games (ZAR) if either API is unavailable

---

## Running the app

This is a static site using ES modules, so it must be served over `http://` — opening `index.html` directly from disk will not work.

**Using VS Code Live Server:**

1. Open the project folder in VS Code.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` → **Open with Live Server**.
4. The app opens at `http://127.0.0.1:5500`.

No `npm install`, no build, no dependencies to download.

---

## Project structure

```
pc-game-deals/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── data/
    │   └── fallbackGames.js     # local ZAR games used if APIs fail
    ├── services/
    │   ├── cheapshark.js        # API calls + normalisation + redirect URLs
    │   └── exchangeRate.js      # USD → ZAR rate (cached in localStorage)
    ├── utils/
    │   ├── calculations.js      # discount, sale detection, cheapest game
    │   ├── search.js            # title search
    │   └── helpers.js           # price formatting, DOM helpers, debounce
    ├── components/
    │   ├── gameCards.js         # card rendering + retailer link logic
    │   └── filters.js           # filter + sort logic
    └── app.js                   # state, wiring, render pipeline
```

---

## Data sources

| API | Purpose | Key required |
|-----|---------|--------------|
| **CheapShark** `cheapshark.com/api/1.0` | Game deals, store names, retailer redirects | No |
| **ExchangeRate.fun** | USD → ZAR exchange rate | No |

**CheapShark endpoints used:**
- `/deals` — current discounted deals (title, prices, `storeID`, `dealID`, `steamAppID`)
- `/stores` — maps `storeID` to store name
- `/redirect?dealID=…` — retailer fallback link

**Retailer link logic:**
1. If a Steam App ID is present → `https://store.steampowered.com/app/{id}`
2. Otherwise → `https://www.cheapshark.com/redirect?dealID={dealID}`

---

## Behaviour when APIs fail

- **CheapShark unavailable** → banner shown, app switches to the local fallback games (prices in ZAR)
- **ExchangeRate.fun unavailable** → prices fall back to displaying the original USD value with the correct currency label, rather than showing a stale or invented rate
- Loading indicators never hang; every failure path resolves to either live data or the fallback dataset

---

## Limitations

- CheapShark does not expose operating-system or launcher metadata, so the app does not offer SYSTEM or LAUNCHER filters — only **store** filtering is supported
- Currency conversion is approximate and reflects the rate at page load
- Deal availability is determined by CheapShark; a deal shown in the list may expire between page load and click
- CheapShark enforces a rate limit on its API; the app surfaces the retry delay when it is hit

---

## Assumption

The project originally assumed CheapShark would return **direct links to the actual game sale page** on each retailer. It does not — it only returns a `dealID` that must be passed through its own redirect endpoint. The final implementation therefore links directly to Steam store pages where a Steam App ID is available, and uses the CheapShark redirect for all other stores.

---

## Tech stack

- **HTML5**, **CSS3** (Grid, Flexbox, custom properties), **vanilla JavaScript (ES6+ modules)**
- No frameworks, no bundler, no runtime dependencies
