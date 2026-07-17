import { BREAKFASTS, APPETITE_LEVELS } from './data.js';
import { DISHES, NUTRITION } from './dishes.js';
import { marketFor, SUPERMARKET_DATA, productsOf, linesCost } from './supermarkets.js';

// ---- Dishes ----------------------------------------------------------------

const N_KEYS = ['kcal', 'prot', 'carb', 'fat', 'fibre', 'iron', 'calcium', 'vitc', 'potassium'];

// With the high-protein option on, the dish's main protein source gets a third more.
function boostedIngredients(d, profile) {
  if (!profile?.proteinBoost) return d.ingredients;
  let anchor = null, anchorProt = 0;
  for (const [name, grams] of d.ingredients) {
    const prot = (NUTRITION[name]?.n.prot || 0) * grams;
    if (prot > anchorProt) { anchor = name; anchorProt = prot; }
  }
  return d.ingredients.map(([name, grams, kind]) =>
    name === anchor ? [name, Math.round(grams * 1.33), kind] : [name, grams, kind]);
}

// What one reference portion of this dish costs at the chosen supermarket, from
// real pack prices. Items whose pack size we can't read (a garlic bulb, a lemon)
// are pennies and skipped.
function costPerServing(ingredients, products) {
  let cost = 0;
  for (const [name, grams] of ingredients) {
    const p = products[name];
    if (p?.packGrams && p.price) cost += (grams / p.packGrams) * p.price;
  }
  return Math.round(cost * 100) / 100;
}

// Per-serving nutrition, allergens and cost are all derived from the ingredient
// list, so a dish is always consistent with what's actually in it.
export function buildDish(d, profile) {
  const ingredients = boostedIngredients(d, profile);
  const per = Object.fromEntries(N_KEYS.map(k => [k, 0]));
  const allergens = new Set();
  for (const [name, grams] of ingredients) {
    const ing = NUTRITION[name];
    if (!ing) continue;
    for (const k of N_KEYS) per[k] += (ing.n[k] * grams) / 100;
    if (ing.allergen) allergens.add(ing.allergen);
  }
  return {
    ...d,
    ingredients,
    allergens: [...allergens],
    perServing: Object.fromEntries(N_KEYS.map(k => [k, Math.round(per[k] * 10) / 10])),
    costPerServing: costPerServing(ingredients, marketFor(profile).products),
  };
}

// keto counts net carbs: total minus fibre
const KETO_MAX_NET_CARB = 15;

export function allowedDishes(profile) {
  const { diet, allergies, dislikes } = profile;
  const hated = (dislikes || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  return DISHES.map(d => buildDish(d, profile)).filter(r => {
    if (r.allergens.some(a => allergies.includes(a))) return false;
    if (diet.includes('vegan') && r.dietLevel < 3) return false;
    if (diet.includes('veggie') && r.dietLevel < 2) return false;
    if (diet.includes('pesc') && r.dietLevel < 1) return false;
    if (diet.includes('gf') && r.allergens.includes('gluten')) return false;
    if (diet.includes('keto') && r.perServing.carb - r.perServing.fibre > KETO_MAX_NET_CARB) return false;
    const text = (r.name + ' ' + r.ingredients.map(i => i[0]).join(' ')).toLowerCase();
    return !hated.some(h => text.includes(h));
  });
}

// Small deterministic random generator so the shuffled order is the same every
// time for the same quiz answers, letting the cursor page through it.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pages through a stable shuffle of every allowed dish. Liked proteins float to
// the front (a preference, not a filter — dislikes and allergies do the excluding).
export function generateRecipes(profile, cursor, count, filterFn) {
  let pool = allowedDishes(profile);
  if (filterFn) pool = pool.filter(filterFn);
  if (!pool.length) return { recipes: [], cursor, total: 0 };
  const order = pool.map((_, i) => i);
  const rand = mulberry32(pool.length * 31 + 7);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const likes = profile.likes || [];
  if (likes.length) {
    const liked = i => (pool[i].tags.some(t => likes.includes(t)) ? 0 : 1);
    order.sort((a, b) => liked(a) - liked(b));
  }
  const out = [];
  for (let n = 0; n < Math.min(count, pool.length); n++) {
    out.push(pool[order[(cursor + n) % pool.length]]);
  }
  return { recipes: out, cursor: (cursor + count) % pool.length, total: pool.length };
}

export function recipeFromId(id, profile) {
  const d = DISHES.find(x => x.id === id);
  return d ? buildDish(d, profile) : null;
}

// Turn a free-text idea into the closest dish in the library.
// (v2 next step: hand this to real AI generation.)
const STOPWORDS = new Set(['the', 'and', 'with', 'something', 'some', 'for', 'plus',
  'nice', 'good', 'dinner', 'meal', 'meals', 'easy', 'quick', 'healthy', 'tasty', 'want', 'like']);

export function recipeFromText(text, profile) {
  const pool = allowedDishes(profile);
  const toks = text.toLowerCase().split(/[^a-z]+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    // try the plural-stripped form too, so "noodles" finds "noodle" and vice versa
    .flatMap(w => (w.endsWith('s') ? [w, w.slice(0, -1)] : [w]));
  let best = null, bestScore = 0;
  for (const r of pool) {
    const name = r.name.toLowerCase();
    const ings = r.ingredients.map(i => i[0]).join(' ').toLowerCase();
    const blurb = r.blurb.toLowerCase();
    // dish-name hits count most, then ingredients, then the description
    const score = toks.reduce((s, t) =>
      s + (name.includes(t) ? 3 : ings.includes(t) ? 2 : blurb.includes(t) ? 1 : 0), 0);
    if (score > bestScore) { best = r; bestScore = score; }
  }
  return best ? { ...best, custom: text } : null;
}

export function methodSteps(r) {
  return r.steps;
}

// ---- Weekly stock ----------------------------------------------------------

export const appetiteFactor = profile => APPETITE_LEVELS[profile.appetite ?? 1][1];

// Age-banded household → adult-equivalent portion count.
// Children (2-12) eat ~0.6 of an adult portion, infants (<2) ~0.25.
export const effectiveEaters = profile => {
  const adults = profile.adults ?? profile.people ?? 2;
  return adults + 0.6 * (profile.children || 0) + 0.25 * (profile.infants || 0);
};

// "2 adults, 1 child" — for subtitles and the cooking page
export const householdLabel = profile => {
  const parts = [];
  const adults = profile.adults ?? profile.people ?? 2;
  parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
  if (profile.children) parts.push(`${profile.children} child${profile.children !== 1 ? 'ren' : ''}`);
  if (profile.infants) parts.push(`${profile.infants} infant${profile.infants !== 1 ? 's' : ''}`);
  return parts.join(', ');
};

// picked: [{id, qty}] — qty is how many nights that meal covers.
export function weekPlan(profile, picked) {
  return picked
    .map(({ id, qty }) => {
      const r = recipeFromId(id, profile);
      return r ? { ...r, nights: qty } : null;
    })
    .filter(Boolean);
}

export function buildStock(profile, picked, breakfastIds, pantryOwned) {
  const factor = appetiteFactor(profile);
  const eaters = effectiveEaters(profile);
  const plan = weekPlan(profile, picked);
  const fresh = new Map(); // name -> {grams, usedBy}
  const pantry = new Map(); // name -> Set(recipe names)
  const add = (name, grams, dish) => {
    const cur = fresh.get(name) || { grams: 0, usedBy: new Set() };
    cur.grams += grams;
    cur.usedBy.add(dish);
    fresh.set(name, cur);
  };

  for (const r of plan) {
    const servings = eaters * r.nights * factor;
    for (const [name, grams, kind] of r.ingredients) {
      if (kind === 'pantry') {
        if (!pantry.has(name)) pantry.set(name, new Set());
        pantry.get(name).add(r.name);
      } else {
        add(name, grams * servings, r.name);
      }
    }
  }

  const bfs = BREAKFASTS.filter(b => breakfastIds.includes(b.id));
  if (bfs.length) {
    const mornings = 7;
    bfs.forEach((b, i) => {
      const base = Math.floor(mornings / bfs.length);
      const n = (base + (i < mornings % bfs.length ? 1 : 0)) * eaters;
      for (const [name, grams, kind] of b.items) {
        if (kind === 'pantry') {
          if (!pantry.has(name)) pantry.set(name, new Set());
          pantry.get(name).add(b.name);
        } else add(name, grams * n, b.name);
      }
    });
  }

  const freshList = [...fresh.entries()].map(([name, { grams, usedBy }]) => ({
    name,
    grams,
    usedBy: [...usedBy],
    qty: grams === 0 ? '' : grams >= 1000 ? `${Math.round(grams / 100) / 10} kg` : `${Math.round(grams / 10) * 10} g`,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const pantryList = [...pantry.entries()].map(([name, usedBy]) => ({
    name, usedBy: [...usedBy], owned: pantryOwned.includes(name),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return { freshList, pantryList, plan };
}

// Apply the user's shopping-list edits: drop skipped lines, cap pack counts.
export function applyTweaks(lines, tweaks) {
  if (!tweaks) return lines;
  return lines
    .filter(i => !tweaks.skipped?.includes(i.name))
    .map(i => (tweaks.packs?.[i.name] ? { ...i, packCap: tweaks.packs[i.name] } : i));
}

// The checkout estimate (whole packs, cupboard included) — the same number the
// shopping list shows, so the running total while picking never disagrees with it.
// Pass a marketId to price the same week at a different supermarket.
// Overlay the user's product swaps (tweaks.swaps: name -> 1-based alt index).
export function applySwaps(products, swaps) {
  if (!swaps || !Object.keys(swaps).length) return products;
  const out = { ...products };
  for (const [name, idx] of Object.entries(swaps)) {
    const alt = out[name]?.alts?.[idx - 1];
    if (alt) out[name] = { ...out[name], ...alt };
  }
  return out;
}

export function estimatedTotal(profile, picked, breakfastIds, pantryOwned, marketId, tweaks, extras) {
  const { freshList, pantryList } = buildStock(profile, picked, breakfastIds, pantryOwned);
  const lines = applyTweaks([...freshList, ...pantryList.filter(p => !p.owned)], tweaks);
  const extraLines = (extras || []).map(e => ({ name: e.name, grams: 0, packs: e.packs }));
  const base = marketId ? productsOf(SUPERMARKET_DATA[marketId], profile) : marketFor(profile).products;
  const products = marketId ? base : applySwaps(base, tweaks?.swaps);
  return linesCost(products, [...lines, ...extraLines]);
}
