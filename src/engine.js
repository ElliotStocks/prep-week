import { PROTEINS, CARBS, VEG, FLAVOURS, METHODS, OIL_N, BREAKFASTS, ACTIVITY_LEVELS } from './data.js';

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

export function allowedComponents(profile) {
  const { diet, allergies, likes, dislikes } = profile;
  const hated = (dislikes || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const notHated = name => !hated.some(h => name.toLowerCase().includes(h));
  let ps = PROTEINS.filter(x => !(x.allergen && allergies.includes(x.allergen)));
  if (diet.includes('vegan')) ps = ps.filter(x => x.dietLevel === 3);
  else if (diet.includes('veggie')) ps = ps.filter(x => x.dietLevel >= 2);
  else if (diet.includes('pesc')) ps = ps.filter(x => x.dietLevel >= 1);
  if (likes.length) {
    const liked = ps.filter(x => likes.includes(x.tag));
    if (liked.length) ps = liked;
  }
  ps = ps.filter(x => notHated(x.name));
  let cs = CARBS.filter(x => !(x.allergen && (allergies.includes(x.allergen) || diet.includes('gf'))));
  cs = cs.filter(x => notHated(x.name));
  const vs = VEG.filter(x => notHated(x.name));
  return { ps, cs, vs };
}

function buildRecipe(p, c, v, f, m) {
  const oilGrams = 10;
  const per = {};
  for (const key of ['kcal', 'prot', 'carb', 'fat', 'fibre', 'iron', 'calcium', 'vitc', 'potassium']) {
    per[key] = (p.n[key] * p.grams + c.n[key] * c.grams + v.n[key] * v.grams + OIL_N[key] * oilGrams) / 100;
  }
  return {
    id: [p.id, c.id, v.id, f.id, m.id].join('~'),
    name: `${f.name} ${p.name} with ${c.name} & ${v.name}`,
    method: m, protein: p, carb: c, veg: v, flavour: f,
    mins: m.mins,
    perServing: Object.fromEntries(Object.entries(per).map(([k, val]) => [k, Math.round(val * 10) / 10])),
  };
}

export function generateRecipes(profile, cursor, count) {
  const { ps, cs, vs } = allowedComponents(profile);
  const out = [];
  let k = cursor;
  if (!ps.length || !cs.length) return { recipes: out, cursor: k };
  const seen = new Set();
  const space = ps.length * cs.length * vs.length * FLAVOURS.length * METHODS.length;
  while (out.length < count && k - cursor < space * 2) {
    const p = ps[(k * 5 + 1) % ps.length];
    const c = cs[(k * 3 + 2) % cs.length];
    const v = vs[(k * 7) % vs.length];
    const f = FLAVOURS[(k * 11 + 4) % FLAVOURS.length];
    const m = METHODS[(k * 13 + 2) % METHODS.length];
    k++;
    const id = [p.id, c.id, v.id, f.id, m.id].join('~');
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(buildRecipe(p, c, v, f, m));
  }
  return { recipes: out, cursor: k };
}

export function recipeFromId(id) {
  const [pid, cid, vid, fid, mid] = id.split('~');
  const p = PROTEINS.find(x => x.id === pid), c = CARBS.find(x => x.id === cid),
    v = VEG.find(x => x.id === vid), f = FLAVOURS.find(x => x.id === fid),
    m = METHODS.find(x => x.id === mid);
  if (!p || !c || !v || !f || !m) return null;
  return buildRecipe(p, c, v, f, m);
}

// Turn a free-text idea into the closest recipe the engine can make.
export function recipeFromText(text, profile) {
  const { ps, cs, vs } = allowedComponents(profile);
  const t = text.toLowerCase();
  const match = (pool, fallback) => pool.find(x => t.includes(x.tag || '') && (x.tag || '').length > 0)
    || pool.find(x => x.name.split(' ').some(w => w.length > 3 && t.includes(w)))
    || fallback;
  const p = match(ps, ps[0]);
  const c = match(cs, cs[0]);
  const v = match(vs, vs[0]);
  const f = FLAVOURS.find(x => x.name.toLowerCase().split(/ & | /).some(w => w.length > 3 && t.includes(w))) || FLAVOURS[0];
  const m = /slow/.test(t) ? METHODS[5] : /grill/.test(t) ? METHODS[2] : /bake|roast|tray/.test(t) ? METHODS[1] : METHODS[0];
  if (!p || !c) return null;
  const r = buildRecipe(p, c, v, f, m);
  r.custom = text;
  return r;
}

export function methodSteps(r) {
  const p = r.protein.name, c = r.carb.name, v = r.veg.name, fl = r.flavour.name.toLowerCase();
  const cook = { 'one-pan': `Heat a large pan with olive oil, add the ${p} and cook until browned.`,
    'traybake': `Toss the ${p} and ${v} with olive oil and the ${fl} seasoning on a large tray. Roast at 200°C.`,
    'grill': `Season the ${p} with the ${fl} mix and grill on high, turning once.`,
    'pan-sear': `Sear the ${p} in a hot pan with olive oil, 3 to 4 minutes each side.`,
    'bake': `Season the ${p} with the ${fl} mix and bake at 190°C until cooked through.`,
    'slow-cook': `Add the ${p}, seasoning and a splash of water to a casserole. Cook low and slow until tender.` };
  return [
    r.carb.dry ? `Cook the ${c} according to pack instructions.` : `Chop the ${c} and roast or boil until tender.`,
    cook[r.method.id],
    r.method.id === 'traybake' ? `Halfway through, give the tray a shake.` : `Steam or pan-fry the ${v} until just tender.`,
    `Portion into containers: ${p}, ${c}, ${v}. Cool before refrigerating.`,
  ];
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
  const fresh = new Map(); // name -> {grams, unit}
  const pantry = new Map(); // name -> Set(recipe names)
  const add = (map, name, grams) => map.set(name, (map.get(name) || 0) + grams);

  for (const r of plan) {
    const servings = totalScale * r.nights;
    add(fresh, r.protein.name, r.protein.grams * servings);
    add(fresh, r.carb.name, r.carb.grams * servings);
    add(fresh, r.veg.name, r.veg.grams * servings);
    for (const item of r.flavour.fresh) add(fresh, item, 0);
    for (const item of r.flavour.pantry) {
      if (!pantry.has(item)) pantry.set(item, new Set());
      pantry.get(item).add(r.name);
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
