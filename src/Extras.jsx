import { EXTRAS } from './extras.js';
import { marketFor } from './supermarkets.js';

const GROUPS = [['snacks', 'Treats & snacks'], ['essentials', 'Household & essentials']];

export default function Extras({ profile, extras, setExtras }) {
  const market = marketFor(profile);
  const packsOf = name => (extras || []).find(e => e.name === name)?.packs || 0;
  const setPacks = (name, packs) => {
    if (packs <= 0) setExtras(prev => prev.filter(e => e.name !== name));
    else if (packsOf(name)) setExtras(prev => prev.map(e => (e.name === name ? { ...e, packs } : e)));
    else setExtras(prev => [...prev, { name, packs }]);
  };
  const added = (extras || []).length;

  return (
    <div>
      <h2>Snacks & essentials</h2>
      <p className="sub">Anything else the house needs this week. Added items join the shopping list and the
        total{added > 0 ? ` — ${added} added so far` : ''}.</p>
      {GROUPS.map(([cat, label]) => (
        <div className="stock-section" key={cat}>
          <h3>{label}</h3>
          <ul className="plain">
            {EXTRAS[cat].map(name => {
              const p = market.products[name];
              const packs = packsOf(name);
              return (
                <li key={name} className="pantry-row">
                  <span>{name}
                    {p && <span className="muted small"> · £{p.price.toFixed(2)}{p.size ? ` · ${p.size}` : ''}</span>}
                  </span>
                  {packs === 0
                    ? <button className="mini" onClick={() => setPacks(name, 1)}>Add</button>
                    : <span className="qty-stepper">
                        <button onClick={() => setPacks(name, packs - 1)}>−</button>
                        <span>{packs}</span>
                        <button onClick={() => setPacks(name, packs + 1)}>+</button>
                      </span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
