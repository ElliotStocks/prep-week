import { BREAKFASTS } from './data.js';

export default function Breakfasts({ profile, breakfasts, setBreakfasts }) {
  const { allergies, diet } = profile;
  let list = BREAKFASTS.filter(b => !b.allergens.some(a => allergies.includes(a)));
  if (diet.includes('vegan')) list = list.filter(b => b.dietLevel === 3);
  if (diet.includes('gf')) list = list.filter(b => !b.allergens.includes('gluten'));
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
          return (
            <div key={b.id} className={'meal-card' + (on ? ' picked' : '')}>
              <div className="tile bfast"><span>🥣</span></div>
              <div className="meal-body">
                <p className="meal-name">{b.name}</p>
                <p className="muted small">{b.perServing.kcal} kcal · {b.perServing.prot}g protein · {b.perServing.fibre}g fibre</p>
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
