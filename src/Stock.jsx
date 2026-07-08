import { buildStock } from './engine.js';
import { BREAKFASTS } from './data.js';

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

  const toggleOwned = name => {
    setPantryOwned(pantryOwned.includes(name) ? pantryOwned.filter(x => x !== name) : [...pantryOwned, name]);
  };

  return (
    <div>
      <h2>Your full weekly stock</h2>
      <p className="sub">Everything the kitchen needs this week for {profile.persons.length}
        {profile.persons.length > 1 ? ' people' : ' person'}: {profile.ndin} dinners
        {bfNames.length ? `, breakfasts every morning` : ''}, spices and staples included.
        Tick anything you already have; the app remembers for future weeks.</p>

      <div className="stock-section">
        <h3>This week’s plan</h3>
        <ul className="plain">
          {plan.map(r => <li key={r.id}><strong>{r.name}</strong> — {r.nights} night{r.nights > 1 ? 's' : ''}</li>)}
          {bfNames.map(n => <li key={n}><strong>{n}</strong> — breakfasts</li>)}
        </ul>
      </div>

      <div className="stock-cols">
        <div className="stock-section">
          <h3>Fresh & weekly items</h3>
          <ul className="plain">
            {freshList.map(i => <li key={i.name}>{i.name}{i.qty && <span className="muted"> — {i.qty}</span>}</li>)}
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

      <div className="ocado-note">
        <strong>Next up:</strong> a “Send to Ocado” button that matches every line above to a real M&amp;S product
        with live prices and fills your basket. Until then, this list is your shop.
      </div>
    </div>
  );
}
