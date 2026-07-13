// Pilot: send a real Prep Week shopping list through Pepesto's product matching
// and create a live Tesco basket session. Costs ~€1.24 per run (/products €0.04 +
// /session €1.20) — run deliberately, not casually. Key lives in ~/.pepesto-key.json.
// Run with: node scripts/pepesto-pilot.mjs

import { readFileSync } from 'node:fs';
import { buildStock } from '../src/engine.js';

const { api_key } = JSON.parse(readFileSync(`${process.env.HOME}/.pepesto-key.json`, 'utf8'));
const API = 'https://s.pepesto.com/api';

const call = async (path, body) => {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api_key}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
};

// The standard test week: 2 people, chilli x2 nights, fajitas x2, salmon traybake x1
const profile = { supermarket: 'ocado', people: 2, allergies: [], diet: ['none'], likes: [], dislikes: '', appetite: 1, proteinBoost: false };
const picked = [
  { id: 'chilli-con-carne', qty: 2 },
  { id: 'chicken-fajita-bowls', qty: 2 },
  { id: 'pesto-salmon-traybake', qty: 1 },
];

const { freshList, pantryList } = buildStock(profile, picked, [], []);
const lines = [
  ...freshList.map(i => (i.grams ? `${Math.round(i.grams)} g ${i.name}` : i.name)),
  ...pantryList.filter(p => !p.owned).map(p => p.name),
];
const manualList = lines.join(', ');
console.log(`Sending ${lines.length} lines to Pepesto:\n${manualList}\n`);

const products = await call('/products', {
  manual_shopping_list: manualList,
  supermarket_domain: 'tesco.com',
  item_names_locale: 'en-GB',
});

let total = 0;
let matched = 0;
console.log('=== Tesco matches (top pick per line) ===');
for (const item of products.items || []) {
  const top = item.products?.[0];
  if (!top) { console.log(`${item.item_name} → NO MATCH`); continue; }
  matched++;
  const units = top.num_units_to_buy || 1;
  const pence = top.product.price?.price ?? 0;
  total += pence * units;
  console.log(`${item.item_name} → ${top.product.product_name} ${units > 1 ? `× ${units} ` : ''}£${((pence * units) / 100).toFixed(2)}`);
}
console.log(`\n${matched}/${(products.items || []).length} lines matched · Tesco basket ≈ £${(total / 100).toFixed(2)}`);

const skus = (products.items || [])
  .filter(i => i.products?.length)
  .map(i => ({ session_token: i.products[0].session_token, num_units_to_buy: i.products[0].num_units_to_buy || 1 }));

console.log(`\nCreating Tesco checkout session for ${skus.length} items (€1.20)...`);
const session = await call('/session', { supermarket_domain: 'tesco.com', skus });
console.log('\nSession created:');
console.log('  session_id:', session.session_id);
console.log('  OPEN THIS TO SEE THE BASKET:', session.payment_redirect_url || JSON.stringify(session));
