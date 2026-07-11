import { BREAKFASTS } from './data.js';
import { marketFor } from './supermarkets.js';

// What one serving costs, pro-rata from real pack prices (same maths as dinners).
const costPerServing = (items, products) => {
  const cost = items.reduce((sum, [name, grams]) => {
    const p = products[name];
    return p?.packGrams && p.price ? sum + (grams / p.packGrams) * p.price : sum;
  }, 0);
  return Math.round(cost * 100) / 100;
};

export default function Breakfasts({ profile, breakfasts, setBreakfasts }) {
  const market = marketFor(profile);
  const { allergies, diet } = profile;
  let list = BREAKFASTS.filter(b => !b.allergens.some(a => allergies.includes(a)));
  if (diet.includes('vegan')) list = list.filter(b => b.dietLevel === 3);
  if (diet.includes('gf')) list = list.filter(b => !b.allergens.includes('gluten'));
  if (diet.includes('keto')) list = list.filter(b => b.perServing.carb - b.perServing.fibre <= 15);
  const hidden = BREAKFASTS.length - list.length;

  const toggle = id => {
    if (breakfasts.includes(id)) setBreakfasts(breakfasts.filter(x => x !== id));
    else if (breakfasts.length < 2) setBreakfasts([...breakfasts, id]);
  };

  const mornings = id => {
    const i = breakfasts.indexOf(id);
    if (i < 0) return 0;
    const base = Math.floor(7 / breakfasts.length);
    return base + (i < 7 % breakfasts.length ? 1 : 0);
  };

  return (
    <div>
      <h2>Breakfasts</h2>
      <p className="sub">Pick up to 2. They repeat across the week’s mornings for everyone, and their ingredients join
        the weekly shopping list.{hidden > 0 && ` ${hidden} hidden because of your allergies or requirements.`}</p>
      <div className="meal-grid">
        {list.map(b => {
          const on = breakfasts.includes(b.id);
          const cost = costPerServing(b.items, market.products);
          return (
            <div key={b.id} className={'meal-card' + (on ? ' picked' : '')}>
              <div className="tile bfast">
                <span>🥣</span>
                <img src={`${import.meta.env.BASE_URL}photos/${b.id}.jpg`} alt="" loading="lazy"
                  onError={e => e.currentTarget.remove()} />
              </div>
              <div className="meal-body">
                <p className="meal-name">{b.name}</p>
                <p className="muted small">{Math.round(b.perServing.kcal)} kcal · {Math.round(b.perServing.prot)}g protein · {Math.round(b.perServing.fibre)}g fibre
                  {cost > 0 && <> · <strong>≈ £{cost.toFixed(2)} a portion</strong></>}</p>
                {on && <p className="nights">{mornings(b.id)} morning{mornings(b.id) > 1 ? 's' : ''} this week</p>}
                <div className="card-actions">
                  <button disabled={!on && breakfasts.length >= 2} onClick={() => toggle(b.id)}>{on ? 'Picked ✓' : 'Pick'}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
