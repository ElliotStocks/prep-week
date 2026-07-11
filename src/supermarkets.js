// One place that knows every supported supermarket: its product snapshot, its
// search-link builder and its display names. Everything else asks marketFor(profile)
// instead of importing a specific supermarket's data.

import { OCADO_PRODUCTS, OCADO_FETCHED_AT } from './ocado-products.js';
import { ALDI_PRODUCTS, ALDI_FETCHED_AT } from './aldi-products.js';
import { searchUrl as ocadoSearchUrl } from './ocado.js';
import { searchUrl as aldiSearchUrl } from './aldi.js';

export const SUPERMARKET_DATA = {
  ocado: {
    label: 'Ocado (M&S range)',
    store: 'Ocado',
    range: 'M&S',
    products: OCADO_PRODUCTS,
    fetchedAt: OCADO_FETCHED_AT,
    searchUrl: ocadoSearchUrl,
  },
  aldi: {
    label: 'Aldi',
    store: 'Aldi',
    range: 'Aldi',
    products: ALDI_PRODUCTS,
    fetchedAt: ALDI_FETCHED_AT,
    searchUrl: aldiSearchUrl,
  },
};

export const marketFor = profile => SUPERMARKET_DATA[profile?.supermarket] || SUPERMARKET_DATA.ocado;

// How many packs of `product` cover `grams` of the ingredient. 1 pack minimum.
export const packsFor = (grams, product) =>
  !grams || !product?.packGrams ? 1 : Math.max(1, Math.ceil(grams / product.packGrams));

// Whole-pack checkout cost of a set of stock-list lines at one supermarket.
export const linesCost = (products, lines) => lines.reduce((sum, i) => {
  const p = products[i.name];
  return p ? sum + p.price * packsFor(i.grams, p) : sum;
}, 0);
