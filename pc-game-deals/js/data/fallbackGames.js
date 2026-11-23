/**
 * 8 local evaluation games — fallback dataset when CheapShark API is unavailable.
 * Price unit: ZAR (South African Rand), clearly distinct from API's USD.
 */
import { CURRENCY } from '../config/constants.js';

export const fallbackGames = [
  { id: 'local-1', title: 'Hollow Knight', normalPrice: 14.99, salePrice: 7.49, currency: CURRENCY.ZAR, store: 'Steam', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-2', title: 'Stardew Valley', normalPrice: 13.99, salePrice: 13.99, currency: CURRENCY.ZAR, store: 'GOG', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-3', title: 'Celeste', normalPrice: 19.99, salePrice: 4.99, currency: CURRENCY.ZAR, store: 'Steam', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-4', title: 'Hades', normalPrice: 24.99, salePrice: 12.49, currency: CURRENCY.ZAR, store: 'Epic Games', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-5', title: 'Portal 2', normalPrice: 9.99, salePrice: 0.99, currency: CURRENCY.ZAR, store: 'Steam', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-6', title: 'Terraria', normalPrice: 9.99, salePrice: 9.99, currency: CURRENCY.ZAR, store: 'GOG', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-7', title: 'Disco Elysium', normalPrice: 39.99, salePrice: 9.99, currency: CURRENCY.ZAR, store: 'GOG', source: 'fallback', dealID: null, thumb: null },
  { id: 'local-8', title: 'Cuphead', normalPrice: 19.99, salePrice: 14.99, currency: CURRENCY.ZAR, store: 'Steam', source: 'fallback', dealID: null, thumb: null },
];