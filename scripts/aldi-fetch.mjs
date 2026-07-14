// Refreshes src/aldi-products.js: for every ingredient in the Aldi dictionary,
// reads Aldi's search results page (server-rendered product tiles) and records
// the best match's title, pack size, price and link. Run with: npm run aldi
// One request per ingredient with a polite pause — takes about two minutes.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALDI_ITEMS, packGrams } from '../src/aldi.js';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const PAUSE_MS = 1000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const stripTags = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// text inside the first <div data-test="<marker>">…</div> of a tile chunk
const textOf = (chunk, marker) => {
  const m = chunk.match(new RegExp(`data-test="${marker}"[^>]*>([\\s\\S]{0,400}?)</div>`));
  return m ? stripTags(m[1]) : null;
};

function parseTiles(html) {
  const tiles = [];
  for (const chunk of html.split(/id="product-tile-/).slice(1)) {
    const href = chunk.match(/href="(\/product\/[^"]+)"/)?.[1];
    const name = chunk.match(/data-test="product-tile"[^>]*title="([^"]+)"/)?.[1];
    const brand = textOf(chunk, 'product-tile__brandname');
    const size = textOf(chunk, 'product-tile__unit-of-measurement');
    const priceBlock = chunk.match(/data-test="product-tile__price"[\s\S]{0,600}?£(\d+\.\d\d)/)?.[1]
      ?? chunk.match(/class="base-price[\s\S]{0,400}?£(\d+\.\d\d)/)?.[1];
    const perUnit = textOf(chunk, 'product-tile__comparison-price');
    if (href && name && priceBlock) {
      tiles.push({
        href, size: size || null,
        perUnit: perUnit ? perUnit.replace(/[()]/g, '') : null,
        title: [brand, name].filter(Boolean).join(' '),
        price: Number(priceBlock),
      });
    }
  }
  return tiles;
}

// "£4.25/1 KG" | "£1.20/100 G" → £ per kg, for cheapest-wins tie-breaks
function perKg(t) {
  const m = (t.perUnit || '').toLowerCase().match(/£(\d+(?:\.\d+)?)\/(\d*\.?\d*)\s*(kg|g|l|ml|litre)/);
  if (!m) return Infinity;
  const qty = Number(m[2] || 1) || 1;
  const unit = { kg: 1000, g: 1, l: 1000, litre: 1000, ml: 1 }[m[3]];
  return (Number(m[1]) / (qty * unit)) * 1000;
}

// Qualifying tiles ranked best-first (score, then cheaper per kg).
// [0] is the pick; the next two become swap alternatives in the app.
function pickRanked(tiles, item, requireOrganic = false) {
  const scored = [];
  for (const t of tiles) {
    const title = t.title.toLowerCase();
    if (requireOrganic && !title.includes('organic')) continue;
    if (!item.must.every(group => group.split('|').some(tok => title.includes(tok)))) continue;
    if (item.not?.some(group => group.split('|').some(tok => title.includes(tok)))) continue;
    let score = 1;
    if (t.size) score += 1;
    scored.push({ t, score, unit: perKg(t) });
  }
  scored.sort((a, b) => b.score - a.score || a.unit - b.unit);
  const seen = new Set();
  return scored.filter(({ t }) => !seen.has(t.href) && seen.add(t.href)).map(s => s.t);
}

const pickBest = (tiles, item, requireOrganic = false) => pickRanked(tiles, item, requireOrganic)[0] || null;

const toRecord = (name, t) => ({
  title: t.title,
  url: `https://www.aldi.co.uk${t.href}`,
  size: t.size,
  perUnit: t.perUnit,
  price: t.price,
  packGrams: packGrams(name, t.size),
});

async function fetchSearch(phrase) {
  const url = `https://www.aldi.co.uk/results?q=${encodeURIComponent(phrase)}`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB' } });
      if (res.ok) return await res.text();
      console.error(`  HTTP ${res.status} for "${phrase}"`);
    } catch (e) {
      console.error(`  fetch failed for "${phrase}": ${e.message}`);
    }
    await sleep(3000);
  }
  return null;
}

// For items whose dictionary entry pins an exact product URL (Aldi's search
// ranking is unstable for these), read price and availability straight from the
// product page's structured data instead of searching.
async function fetchPinned(item) {
  try {
    const res = await fetch(item.pin, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB' } });
    if (!res.ok) return null;
    const html = await res.text();
    for (const block of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
      try {
        const data = JSON.parse(block.replace(/<script[^>]*>|<\/script>/g, ''));
        if (data['@type'] === 'Product' && data.offers?.price) {
          if (data.offers.availability && !data.offers.availability.includes('InStock')) return null;
          return { title: data.name, href: new URL(item.pin).pathname, size: item.pinSize || null, perUnit: null, price: Number(data.offers.price) };
        }
      } catch { /* try next block */ }
    }
  } catch { /* fall through */ }
  return null;
}

const products = {};
const organic = {};
const missed = [];
const names = Object.keys(ALDI_ITEMS);
for (const [i, name] of names.entries()) {
  const item = ALDI_ITEMS[name];
  let best;
  if (item.pin) {
    best = await fetchPinned(item);
    if (best && best.title.toLowerCase().includes('organic')) {
      organic[name] = { title: best.title, url: `https://www.aldi.co.uk${best.href}`, size: best.size, perUnit: best.perUnit, price: best.price, packGrams: packGrams(name, best.size) };
    }
    if (best) products[name] = { title: best.title, url: `https://www.aldi.co.uk${best.href}`, size: best.size, perUnit: best.perUnit, price: best.price, packGrams: packGrams(name, best.size), alts: [] };
  } else {
    const html = await fetchSearch(item.search);
    const tiles = html ? parseTiles(html) : [];
    const ranked = pickRanked(tiles, item);
    best = ranked[0];
    // the best organic option in the same results, for the "prefer organic" setting
    const organicBest = pickBest(tiles, item, true);
    if (organicBest) organic[name] = toRecord(name, organicBest);
    if (best) {
      products[name] = {
        ...toRecord(name, best),
        // swap alternatives: the next two qualifying tiles
        alts: ranked.slice(1, 3).map(t => toRecord(name, t)),
      };
    }
  }
  if (best) {
    console.log(`[${i + 1}/${names.length}] ${name} → ${best.title} (${best.size ?? '?'}) £${best.price.toFixed(2)}`);
  } else {
    missed.push(name);
    console.log(`[${i + 1}/${names.length}] ${name} → NO MATCH`);
  }
  await sleep(PAUSE_MS);
}

// Refuse to save a collapsed result set: if the site blocked us, overwriting
// the snapshot would wipe every price in the live app. Fail loudly instead.
const MIN_PRODUCTS = 55;
if (Object.keys(products).length < MIN_PRODUCTS) {
  console.error(`\nOnly ${Object.keys(products).length} products matched (expected ~86).`);
  console.error('Refusing to overwrite the snapshot — the site probably blocked this run.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const out = `// Generated by scripts/aldi-fetch.mjs on ${today} — do not edit by hand.
// Refresh with: npm run aldi
export const ALDI_FETCHED_AT = '${today}';
export const ALDI_PRODUCTS = ${JSON.stringify(products, null, 2)};
// Best organic alternative per ingredient, used by the "prefer organic" setting.
export const ALDI_ORGANIC = ${JSON.stringify(organic, null, 2)};
`;
const dest = fileURLToPath(new URL('../src/aldi-products.js', import.meta.url));
writeFileSync(dest, out);
console.log(`\nWrote ${Object.keys(products).length}/${names.length} products to src/aldi-products.js`);
if (missed.length) console.log(`No match for: ${missed.join(', ')}`);
