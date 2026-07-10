import { BREAKFASTS, ACTIVITY_LEVELS } from './data.js';
import { DISHES, NUTRITION } from './dishes.js';

export function personTargets(p) {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  const bmr = p.gender === 'm' ? base + 5 : p.gender === 'f' ? base - 161 : base - 78;
  let kcal = bmr * ACTIVITY_LEVELS[p.activity][1];
  if (p.goal === 'lose') kcal *= 0.85;
  if (p.goal === 'build') kcal *= 1.1;
  const prot = p.weight * (p.goal === 'maintain' ? 1.5 : 1.8);
  return { kcal: Math.max(Math.round(kcal / 50) * 50, 1000), prot: Math.round(prot / 5) * 5 };
}

const REF_DINNER_KCAL = 650;

export function personScale(p) {
  const t = personTargets(p);
  const dinnerKcal = t.kcal * 0.35;
  return Math.min(Math.max(dinnerKcal / REF_DINNER_KCAL, 0.6), 1.5);
}

// ---- Dishes ----------------------------------------------------------------

const N_KEYS = ['kcal', 'prot', 'carb', 'fat', 'fibre', 'iron', 'calcium', 'vitc', 'potassium'];

// Per-serving nutrition and allergens are derived from the ingredient table, so a
// dish is always consistent with what's actually in it.
export function buildDish(d) {
  const per = Object.fromEntries(N_KEYS.map(k => [k, 0]));
  const allergens = new Set();
  for (const [name, grams] of d.ingredients) {
    const ing = NUTRITION[name];
    if (!ing) continue;
    for (const k of N_KEYS) per[k] += (ing.n[k] * grams) / 100;
    if (ing.allergen) allergens.add(ing.allergen);
  }
  return {
    ...d,
    allergens: [...allergens],
    perServing: Object.fromEntries(N_KEYS.map(k => [k, Math.round(per[k] * 10) / 10])),
  };
}

export function allowedDishes(profile) {
  const { diet, allergies, dislikes } = profile;
  const hated = (dislikes || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  return DISHES.map(buildDish).filter(r => {
    if (r.allergens.some(a => allergies.includes(a))) return false;
    if (diet.includes('vegan') && r.dietLevel < 3) return false;
    if (diet.includes('veggie') && r.dietLevel < 2) return false;
    if (diet.includes('pesc') && r.dietLevel < 1) return false;
    if (diet.includes('gf') && r.allergens.includes('gluten')) return false;
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
export function generateRecipes(profile, cursor, count) {
  const pool = allowedDishes(profile);
  if (!pool.length) return { recipes: [], cursor };
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
  return { recipes: out, cursor: (cursor + count) % pool.length };
}

export function recipeFromId(id) {
  const d = DISHES.find(x => x.id === id);
  return d ? buildDish(d) : null;
}

// Turn a free-text idea into the closest dish in the library.
// (v2 next step: hand this to real AI generation.)
const STOPWORDS = new Set(['the', 'and', 'with', 'something', 'some', 'for', 'plus',
  'nice', 'good', 'dinner', 'meal', 'meals', 'easy', 'quick', 'healthy', 'tasty', 'want', 'like']);

export function recipeFromText(text, profile) {
  const pool = allowedDishes(profile);
  const toks = text.toLowerCase().split(/[^a-z]+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
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

function nightsFor(index, totalDinners, recipeCount) {
  const base = Math.floor(totalDinners / recipeCount);
  return base + (index < totalDinners % recipeCount ? 1 : 0);
}

export function weekPlan(profile, pickedIds) {
  const recipes = pickedIds.map(recipeFromId).filter(Boolean);
  return recipes.map((r, i) => ({ ...r, nights: nightsFor(i, profile.ndin, recipes.length) }));
}

export function buildStock(profile, pickedIds, breakfastIds, pantryOwned) {
  const totalScale = profile.persons.reduce((s, p) => s + personScale(p), 0);
  const plan = weekPlan(profile, pickedIds);
  const fresh = new Map(); // name -> grams
  const pantry = new Map(); // name -> Set(recipe names)
  const add = (map, name, grams) => map.set(name, (map.get(name) || 0) + grams);

  for (const r of plan) {
    const servings = totalScale * r.nights;
    for (const [name, grams, kind] of r.ingredients) {
      if (kind === 'pantry') {
        if (!pantry.has(name)) pantry.set(name, new Set());
        pantry.get(name).add(r.name);
      } else {
        add(fresh, name, grams * servings);
      }
    }
  }

  const bfs = BREAKFASTS.filter(b => breakfastIds.includes(b.id));
  if (bfs.length) {
    const mornings = 7;
    bfs.forEach((b, i) => {
      const n = nightsFor(i, mornings, bfs.length) * profile.persons.length;
      for (const [name, grams, kind] of b.items) {
        if (kind === 'pantry') {
          if (!pantry.has(name)) pantry.set(name, new Set());
          pantry.get(name).add(b.name);
        } else add(fresh, name, grams * n);
      }
    });
  }

  const freshList = [...fresh.entries()].map(([name, grams]) => ({
    name,
    grams,
    qty: grams === 0 ? '' : grams >= 1000 ? `${Math.round(grams / 100) / 10} kg` : `${Math.round(grams / 10) * 10} g`,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const pantryList = [...pantry.entries()].map(([name, usedBy]) => ({
    name, usedBy: [...usedBy], owned: pantryOwned.includes(name),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return { freshList, pantryList, plan };
}
