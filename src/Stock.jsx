import { buildStock } from './engine.js';
import { BREAKFASTS } from './data.js';
import { searchUrl, packsFor } from './ocado.js';
import { OCADO_PRODUCTS, OCADO_FETCHED_AT } from './ocado-products.js';

// One stock-list line's Ocado match: the real M&S product with pack maths and a link,
// or a pre-filled search link when nothing matched.
function OcadoLine({ name, grams }) {
  const p = OCADO_PRODUCTS[name];
  if (!p) {
    return <a className="ocado-link" href={searchUrl(name)} target="_blank" rel="noreferrer">find on Ocado ↗</a>;
  }
  const packs = packsFor(grams, p);
  return (
    <a className="ocado-match" href={p.url} target="_blank" rel="noreferrer">
      {p.title}{p.size ? ` · ${p.size}` : ''} · £{p.price.toFixed(2)}
      {packs > 1 ? ` × ${packs} packs = £${(p.price * packs).toFixed(2)}` : ''} ↗
    </a>
  );
}

const linesCost = lines => lines.reduce((sum, i) => {
  const p = OCADO_PRODUCTS[i.name];
  return p ? sum + p.price * packsFor(i.grams, p) : sum;
}, 0);

const niceDate = iso => new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Stock({ profile, picked, breakfasts, pantryOwned, setPantryOwned }) {
  if (!picked.length && !breakfasts.length) {
    return (
      <div>
        <h2>Your full weekly stock</h2>
        <p className="sub">Pick some meals first and the whole week’s shopping builds itself here: fresh food,
          breakfasts, spices and cupboard staples.</p>
      </div>
    );
  }

  const { freshList, pantryList, plan } = buildStock(profile, picked, breakfasts, pantryOwned);
  const toBuy = pantryList.filter(p => !p.owned);
  const owned = pantryList.filter(p => p.owned);
  const bfNames = BREAKFASTS.filter(b => breakfasts.includes(b.id)).map(b => b.name);

  const shopLines = [...freshList, ...toBuy];
  const matched = shopLines.filter(i => OCADO_PRODUCTS[i.name]).length;
  const freshPacks = linesCost(freshList);
  const cupboard = linesCost(toBuy);
  const total = freshPacks + cupboard;
  // What this week's cooking actually uses, pro-rata by grams — the rest of each
  // pack stays in the kitchen for future weeks.
  const eatenThisWeek = freshList.reduce((sum, i) => {
    const p = OCADO_PRODUCTS[i.name];
    return p?.packGrams && i.grams ? sum + Math.min((i.grams / p.packGrams) * p.price, p.price * packsFor(i.grams, p)) : sum;
  }, 0);
  const carryOver = Math.max(freshPacks - eatenThisWeek, 0);

  const toggleOwned = name => {
    setPantryOwned(pantryOwned.includes(name) ? pantryOwned.filter(x => x !== name) : [...pantryOwned, name]);
  };

  return (
    <div>
      <h2>Your full weekly stock</h2>
      <p className="sub">Everything the kitchen needs this week for {profile.people}
        {profile.people > 1 ? ' people' : ' person'}: {plan.reduce((s, r) => s + r.nights, 0)} dinners
        {bfNames.length ? `, breakfasts every morning` : ''}, spices and staples included.
        Tick anything you already have; the app remembers for future weeks.</p>

      <div className="ocado-note">
        <div className="ocado-total">Estimated checkout total: £{total.toFixed(2)}</div>
        <ul className="plain checkout-split">
          <li>≈ £{eatenThisWeek.toFixed(2)} — food this week actually eats (the “a portion” prices)</li>
          {carryOver > 0.5 && <li>≈ £{carryOver.toFixed(2)} — spare pack contents that carry over to future weeks</li>}
          {cupboard > 0 && <li>£{cupboard.toFixed(2)} — cupboard stock bought once (tick what you own and it disappears)</li>}
        </ul>
        {matched} of {shopLines.length} lines matched to real M&amp;S products
        {OCADO_FETCHED_AT ? `, prices checked ${niceDate(OCADO_FETCHED_AT)}` : ''}. Every link opens
        Ocado in a new tab — the app never orders anything; you always fill and confirm the basket yourself.
      </div>

      <div className="stock-section">
        <h3>This week’s plan</h3>
        <ul className="plain">
          {plan.map(r => <li key={r.id}><strong>{r.name}</strong> — {r.nights} night{r.nights > 1 ? 's' : ''}
            {r.costPerServing > 0 && <span className="muted"> · ≈ £{r.costPerServing.toFixed(2)} a portion</span>}</li>)}
          {bfNames.map(n => <li key={n}><strong>{n}</strong> — breakfasts</li>)}
        </ul>
      </div>

      <div className="stock-cols">
        <div className="stock-section">
          <h3>Fresh & weekly items</h3>
          <ul className="plain">
            {freshList.map(i => (
              <li key={i.name}>
                {i.name}{i.qty && <span className="muted"> — {i.qty}</span>}
                <OcadoLine name={i.name} grams={i.grams} />
              </li>
            ))}
          </ul>
        </div>
        <div className="stock-section">
          <h3>Store cupboard & spices — to buy</h3>
          {toBuy.length === 0 && <p className="muted">Nothing needed — your cupboard covers this week.</p>}
          <ul className="plain">
            {toBuy.map(i => (
              <li key={i.name}>
                <label>
                  <input type="checkbox" checked={false} onChange={() => toggleOwned(i.name)} /> {i.name}
                  <span className="muted small"> · for {i.usedBy.slice(0, 2).join(', ')}{i.usedBy.length > 2 ? '…' : ''}</span>
                </label>
                <OcadoLine name={i.name} />
              </li>
            ))}
          </ul>
          {owned.length > 0 && <>
            <h3 className="spaced">Already in your cupboard</h3>
            <ul className="plain">
              {owned.map(i => (
                <li key={i.name} className="owned">
                  <label><input type="checkbox" checked onChange={() => toggleOwned(i.name)} /> {i.name}</label>
                </li>
              ))}
            </ul>
          </>}
        </div>
      </div>

    </div>
  );
}
