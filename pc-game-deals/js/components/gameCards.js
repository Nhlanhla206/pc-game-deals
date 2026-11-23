import { isOnSale, calculateDiscount } from '../utils/calculations.js';
import { formatPrice, createEl } from '../utils/helpers.js';

/**
 * Resolve the best deal URL for a game.
 * Prefers direct store links; falls back to CheapShark redirect.
 * @param {object} game
 * @returns {string|null}
 */
export function getStoreDealUrl(game) {
  const directLink = getDirectStoreLink(game);
  if (directLink) return directLink;

  const steamLink = getSteamDirectLink(game);
  if (steamLink) return steamLink;

  return getCheapSharkFallbackUrl(game);
}

function getDirectStoreLink(game) {
  if (!game.externalLinks || typeof game.externalLinks !== 'object') return null;

  const storeName = game.store;
  if (storeName && game.externalLinks[storeName]) {
    return game.externalLinks[storeName];
  }

  for (const [key, url] of Object.entries(game.externalLinks)) {
    if (key.toLowerCase() === (storeName || '').toLowerCase()) return url;
  }

  return null;
}

function getSteamDirectLink(game) {
  if (!game.steamAppID) return null;
  if (!game.store || game.store.toLowerCase() !== 'steam') return null;
  return `https://store.steampowered.com/app/${game.steamAppID}`;
}

function getCheapSharkFallbackUrl(game) {
  if (!game.dealID) return null;
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(game.dealID)}`;
}

/**
 * Create the image section of a game card.
 * @param {object} game
 * @returns {HTMLElement}
 */
export function createImageSection(game) {
  const wrapper = createEl('div', { className: 'card-image-wrapper' });

  if (game.thumb) {
    const img = createEl('img', {
      src: game.thumb,
      alt: `${game.title} cover art`,
      loading: 'lazy',
    });
    img.addEventListener('error', () => {
      img.replaceWith(createFallbackIcon());
    }, { once: true });
    wrapper.appendChild(img);
  } else {
    wrapper.appendChild(createFallbackIcon());
  }

  const discount = calculateDiscount(game);
  if (discount > 0) {
    wrapper.appendChild(createEl('span', {
      className: 'discount-badge',
      textContent: `-${discount}%`,
    }));
  }

  if (isOnSale(game)) {
    wrapper.appendChild(createEl('span', {
      className: 'on-sale-badge',
      textContent: 'ON SALE',
    }));
  }

  return wrapper;
}

/**
 * Create the price section of a game card.
 * @param {object} game
 * @returns {HTMLElement}
 */
export function createPriceSection(game) {
  const container = createEl('div', { className: 'price-information' });

  container.appendChild(createEl('span', {
    className: 'sale-price',
    textContent: formatPrice(game.salePrice, game.currency),
  }));

  if (isOnSale(game)) {
    container.appendChild(createEl('span', {
      className: 'normal-price',
      textContent: formatPrice(game.normalPrice, game.currency),
    }));
  }

  return container;
}

/**
 * Create the store information section.
 * @param {object} game
 * @returns {HTMLElement}
 */
export function createStoreSection(game) {
  return createEl('div', { className: 'store-information' }, [
    createEl('span', { textContent: game.store || 'Store' }),
    createEl('span', { textContent: `· ${game.currency}` }),
  ]);
}

/**
 * Create the retailer action link.
 * @param {object} game
 * @returns {HTMLElement}
 */
export function createRetailerLink(game) {
  const dealUrl = getStoreDealUrl(game);
  const isAvailable = Boolean(dealUrl);

  const link = createEl('a', {
    className: isAvailable ? 'retailer-action' : 'retailer-action disabled',
    href: dealUrl || '#',
    target: '_blank',
    rel: 'noopener noreferrer',
    textContent: isAvailable ? 'View Deal' : 'Unavailable',
  });

  if (!isAvailable) {
    link.addEventListener('click', e => e.preventDefault());
    link.setAttribute('aria-disabled', 'true');
  }

  return link;
}

/**
 * Create a single game card DOM element.
 * @param {object} game
 * @returns {HTMLElement}
 */
export function createGameCard(game) {
  const card = createEl('article', {
    className: 'game-card',
    role: 'listitem',
    'aria-label': game.title,
  });

  card.appendChild(createImageSection(game));

  const footer = createEl('div', { className: 'card-footer' });

  footer.appendChild(createEl('h3', {
    className: 'game-title',
    textContent: game.title,
  }));

  footer.appendChild(createPriceSection(game));
  footer.appendChild(createStoreSection(game));
  footer.appendChild(createRetailerLink(game));

  card.appendChild(footer);

  return card;
}

function createFallbackIcon() {
  return createEl('div', {
    className: 'card-image-fallback',
    'aria-hidden': 'true',
    innerHTML: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      <circle cx="7" cy="17" r="1"/>
      <circle cx="17" cy="17" r="1"/>
    </svg>`,
  });
}