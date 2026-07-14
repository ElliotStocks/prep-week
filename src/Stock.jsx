import { useState } from 'react';
import { buildStock } from './engine.js';
import { BREAKFASTS } from './data.js';
import { marketFor, SUPERMARKET_DATA, productsOf, packsFor, linesCost } from './supermarkets.js';

// One stock-list line's match at the chosen supermarket: the real product with
// pack maths and a link, or a pre-filled search link when nothing matched.
function ProductLine({ market, name, grams, packCap, fixedPacks }) {
  const p = market.products[name];
  if (!p) {
    return <a className="ocado-link" href={market.searchUrl(name)} target="_blank" rel="noreferrer">find on {market.store} ↗</a>;
  }
  const natural = packsFor(grams, p);
  const packs = fixedPacks ?? (packCap ? Math.min(natural, packCap) : natural);
  return (
    <a className="ocado-match" href={p.url} target="_blank" rel="noreferrer">
      {p.title}{p.size ? ` · ${p.size}` : ''} · £{p.price.toFixed(2)}
      {packs > 1 ? ` × ${packs} packs = £${(p.price * packs).toFixed(2)}` : ''}
      {packCap && packCap < natural ? ` (reduced from ${natural})` : ''} ↗
    </a>
  );
}

const niceDate = iso => new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Stock({ profile, picked, breakfasts, pantryOwned, setPantryOwned, listTweaks, setListTweaks, extras, setExtras, onClearWeek }) {
  const [copied, setCopied] = useState(false);
  if (!picked.length && !breakfasts.length && !(extras || []).length) {
    return (
      <div>
        <h2>Your full weekly stock</h2>
        <p className="sub">Pick some meals first and the whole week’s shopping builds itself here: fresh food,
          breakfasts, spices and cupboard staples.</p>
      </div>
    );
  }

  const market = marketFor(profile);
  const { freshList, pantryList, plan } = buildStock(profile, picked, breakfasts, pantryOwned);
  const toBuy = pantryList.filter(p => !p.owned);
  const owned = pantryList.filter(p => p.owned);
  const bfNames = BREAKFASTS.filter(b => breakfasts.includes(b.id)).map(b => b.name);

  // the user's per-week edits: lines they chose not to buy, packs they reduced
  const tw = listTweaks || { skipped: [], packs: {} };
  const skippedSet = new Set(tw.skipped);
  const withTweaks = list => list.filter(i => !skippedSet.has(i.name))
    .map(i => (tw.packs[i.name] ? { ...i, packCap: tw.packs[i.name] } : i));
  const freshActive = withTweaks(freshList);
  const toBuyActive = withTweaks(toBuy);
  const skippedLines = [...freshList, ...toBuy].filter(i => skippedSet.has(i.name));
  const skip = name => setListTweaks({ ...tw, skipped: [...tw.skipped, name] });
  const unskip = name => setListTweaks({ ...tw, skipped: tw.skipped.filter(n => n !== name) });
  const setCap = (name, cap) => {
    const packs = { ...tw.packs };
    if (cap) packs[name] = cap; else delete packs[name];
    setListTweaks({ ...tw, packs });
  };

  // snacks & essentials the user added by hand
  const extraItems = extras || [];
  const extraLines = extraItems.map(e => ({ name: e.name, grams: 0, packs: e.packs, qty: '' }));
  const setExtraPacks = (name, packs) => {
    if (packs <= 0) setExtras(prev => prev.filter(e => e.name !== name));
    else setExtras(prev => prev.map(e => (e.name === name ? { ...e, packs } : e)));
  };

  const shopLines = [...freshActive, ...toBuyActive, ...extraLines];
  const matched = shopLines.filter(i => market.products[i.name]).length;
  const freshPacks = linesCost(market.products, freshActive);
  const cupboard = linesCost(market.products, toBuyActive);
  const extrasCost = linesCost(market.products, extraLines);
  const total = freshPacks + cupboard + extrasCost;
  // What this week's cooking actually uses, pro-rata by grams — the rest of each
  // pack stays in the kitchen for future weeks.
  const eatenThisWeek = freshActive.reduce((sum, i) => {
    const p = market.products[i.name];
    if (!p?.packGrams || !i.grams) return sum;
    const packs = i.packCap ? Math.min(packsFor(i.grams, p), i.packCap) : packsFor(i.grams, p);
    return sum + Math.min((i.grams / p.packGrams) * p.price, p.price * packs);
  }, 0);
  const carryOver = Math.max(freshPacks - eatenThisWeek, 0);

  // The same week priced at the other supermarkets — only shown when the other
  // shop's catalogue covers enough of the list to make the comparison fair.
  const rivals = Object.entries(SUPERMARKET_DATA)
    .filter(([id, m]) => id !== profile.supermarket && m.fetchedAt)
    .map(([, m]) => {
      const products = productsOf(m, profile);
      const coverage = shopLines.filter(i => products[i.name]).length / (shopLines.length || 1);
      return { store: m.store, total: linesCost(products, shopLines), coverage };
    })
    .filter(r => r.coverage >= 0.8);

  const setOwned = (name, isOwned) => {
    setPantryOwned(isOwned ? [...pantryOwned, name] : pantryOwned.filter(x => x !== name));
  };

  const copyList = () => {
    const line = i => {
      const p = market.products[i.name];
      if (!p) return `• ${i.name}${i.qty ? ` — ${i.qty}` : ''}`;
      const natural = packsFor(i.grams, p);
      const packs = i.packs ?? (i.packCap ? Math.min(natural, i.packCap) : natural);
      return `• ${i.name}${i.qty ? ` — ${i.qty}` : ''}: ${p.title}${p.size ? ` (${p.size})` : ''}${packs > 1 ? ` × ${packs}` : ''} — £${(p.price * packs).toFixed(2)}`;
    };
    const text = [
      `PREP WEEK shopping list — ${market.store}`,
      `Estimated total: £${total.toFixed(2)}`,
      '',
      'FRESH & WEEKLY',
      ...freshActive.map(line),
      ...(toBuyActive.length ? ['', 'STORE CUPBOARD', ...toBuyActive.map(line)] : []),
      ...(extraLines.length ? ['', 'SNACKS & ESSENTIALS', ...extraLines.map(line)] : []),
    ].join('\n');
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    navigator.clipboard.writeText(text).then(done).catch(() => {
      // older browsers and some installed-app contexts: invisible textarea fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      done();
    });
  };

  return (
    <div>
      <h2>Your full weekly stock</h2>
      <p className="sub">Everything the kitchen needs this week for {profile.people}
        {profile.people > 1 ? ' people' : ' person'}: {plan.reduce((s, r) => s + r.nights, 0)} dinners
        {bfNames.length ? `, breakfasts every morning` : ''}, spices and staples included.</p>

      <div className="ocado-note">
        <div className="note-head">
          <div className="ocado-total">Estimated checkout total: £{total.toFixed(2)}</div>
          <button className="mini" onClick={copyList}>{copied ? 'Copied ✓' : 'Copy list'}</button>
        </div>
        <ul className="plain checkout-split">
          <li>≈ £{eatenThisWeek.toFixed(2)} — food this week actually eats (the “a portion” prices)</li>
          {carryOver > 0.5 && <li>≈ £{carryOver.toFixed(2)} — spare pack contents that carry over to future weeks</li>}
          {cupboard > 0 && <li>£{cupboard.toFixed(2)} — cupboard stock bought once (mark what you own and it disappears)</li>}
          {extrasCost > 0 && <li>£{extrasCost.toFixed(2)} — snacks &amp; essentials you added</li>}
        </ul>
        {rivals.map(r => (
          <p className="rival-price" key={r.store}>The same week at {r.store}: ≈ £{r.total.toFixed(2)} —
            switch supermarket in Settings to shop there instead.</p>
        ))}
        {matched} of {shopLines.length} lines matched to real {market.range} products
        {market.fetchedAt ? `, prices checked ${niceDate(market.fetchedAt)}` : ''}. Every link opens
        {' '}{market.store} in a new tab — the app never orders anything; you always fill and confirm the basket yourself.
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
            {freshActive.map(i => {
              const p = market.products[i.name];
              const natural = p ? packsFor(i.grams, p) : 1;
              const eff = i.packCap ? Math.min(natural, i.packCap) : natural;
              return (
                <li key={i.name}>
                  <div className="pantry-row">
                    <span>{i.name}{i.qty && <span className="muted"> — {i.qty}</span>}</span>
                    <span className="line-controls">
                      {eff > 1 && <button className="mini" title="Buy one pack fewer" onClick={() => setCap(i.name, eff - 1)}>− pack</button>}
                      {i.packCap && i.packCap < natural && <button className="mini" title="Back to the suggested amount" onClick={() => setCap(i.name, null)}>reset</button>}
                      <button className="mini" title="Don’t buy this" onClick={() => skip(i.name)}>✕</button>
                    </span>
                  </div>
                  <ProductLine market={market} name={i.name} grams={i.grams} packCap={i.packCap} />
                </li>
              );
            })}
          </ul>
          {skippedLines.length > 0 && <>
            <h3 className="spaced">Not buying this week</h3>
            <ul className="plain">
              {skippedLines.map(i => (
                <li key={i.name} className="pantry-row owned">
                  <span>{i.name}</span>
                  <button className="mini" onClick={() => unskip(i.name)}>Add back</button>
                </li>
              ))}
            </ul>
          </>}
        </div>
        <div className="stock-section">
          <h3>Store cupboard & spices</h3>
          <p className="muted small">Bought once, used for weeks. Already got one? Say so and it drops off the list.</p>
          {toBuyActive.length === 0 && <p className="muted">Nothing needed — your cupboard covers this week.</p>}
          <ul className="plain">
            {toBuyActive.map(i => (
              <li key={i.name}>
                <div className="pantry-row">
                  <span>{i.name}
                    <span className="muted small"> · for {i.usedBy.slice(0, 2).join(', ')}{i.usedBy.length > 2 ? '…' : ''}</span>
                  </span>
                  <button className="mini" onClick={() => setOwned(i.name, true)}>I have this</button>
                </div>
                <ProductLine market={market} name={i.name} />
              </li>
            ))}
          </ul>
          {owned.length > 0 && <>
            <h3 className="spaced">In your cupboard — not being bought</h3>
            <ul className="plain">
              {owned.map(i => (
                <li key={i.name} className="pantry-row owned">
                  <span>{i.name}</span>
                  <button className="mini" onClick={() => setOwned(i.name, false)}>Ran out — buy again</button>
                </li>
              ))}
            </ul>
          </>}
        </div>
      </div>

      {extraItems.length > 0 && (
        <div className="stock-section">
          <h3>Snacks & essentials</h3>
          <p className="muted small">Added from the Snacks &amp; essentials section on the Meals page.</p>
          <ul className="plain">
            {extraItems.map(e => (
              <li key={e.name}>
                <div className="pantry-row">
                  <span>{e.name}</span>
                  <span className="qty-stepper">
                    <button onClick={() => setExtraPacks(e.name, e.packs - 1)}>−</button>
                    <span>{e.packs}</span>
                    <button onClick={() => setExtraPacks(e.name, e.packs + 1)}>+</button>
                  </span>
                </div>
                <ProductLine market={market} name={e.name} fixedPacks={e.packs} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="center">
        <button className="ghost" onClick={onClearWeek}>Start a new week</button>
      </div>
    </div>
  );
}
