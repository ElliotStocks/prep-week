// One place that knows every supported supermarket: its product snapshot, its
// search-link builder and its display names. Everything else asks marketFor(profile)
// instead of importing a specific supermarket's data.

import { OCADO_PRODUCTS, OCADO_ORGANIC, OCADO_FETCHED_AT } from './ocado-products.js';
import { ALDI_PRODUCTS, ALDI_ORGANIC, ALDI_FETCHED_AT } from './aldi-products.js';
import { searchUrl as ocadoSearchUrl } from './ocado.js';
import { searchUrl as aldiSearchUrl } from './aldi.js';

export const SUPERMARKET_DATA = {
  ocado: {
    label: 'Ocado (M&S range)',
    store: 'Ocado',
    range: 'M&S',
    products: OCADO_PRODUCTS,
    organic: OCADO_ORGANIC,
    fetchedAt: OCADO_FETCHED_AT,
    searchUrl: ocadoSearchUrl,
  },
  aldi: {
    label: 'Aldi',
    store: 'Aldi',
    range: 'Aldi',
    products: ALDI_PRODUCTS,
    organic: ALDI_ORGANIC,
    fetchedAt: ALDI_FETCHED_AT,
    searchUrl: aldiSearchUrl,
  },
};

// The product map a given user shops from: with "prefer organic" on, organic
// versions overlay the standard ones wherever the supermarket sells them.
export const productsOf = (market, profile) =>
  profile?.organicPref ? { ...market.products, ...market.organic } : market.products;

export const marketFor = profile => {
  const m = SUPERMARKET_DATA[profile?.supermarket] || SUPERMARKET_DATA.ocado;
  return { ...m, products: productsOf(m, profile) };
};

// How many packs of `product` cover `grams` of the ingredient. 1 pack minimum.
export const packsFor = (grams, product) =>
  !grams || !product?.packGrams ? 1 : Math.max(1, Math.ceil(grams / product.packGrams));

// Whole-pack checkout cost of a set of stock-list lines at one supermarket.
// A line's packCap (user chose to buy fewer packs) caps the count; a line's
// packs (extras — user chose exactly how many) sets it outright.
export const linesCost = (products, lines) => lines.reduce((sum, i) => {
  const p = products[i.name];
  if (!p) return sum;
  const packs = i.packs ?? (i.packCap ? Math.min(packsFor(i.grams, p), i.packCap) : packsFor(i.grams, p));
  return sum + p.price * packs;
}, 0);
