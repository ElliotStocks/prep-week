import { useState } from 'react';
import { ALLERGY_OPTIONS, DIET_OPTIONS, LIKE_OPTIONS, SUPERMARKETS, SUPERMARKETS_SOON, APPETITE_LEVELS } from './data.js';

const DIET_ICONS = { none: '🍽️', veggie: '🥦', vegan: '🌱', pesc: '🐟', gf: '🌾', keto: '🥑' };
const LIKE_ICONS = { chicken: '🍗', beef: '🥩', turkey: '🦃', fish: '🐟', shellfish: '🦐', eggs: '🥚', legumes: '🫘', tofu: '🌱' };

// Icon tile grid — multi-select unless single
function Tiles({ options, icons, value, onChange, single }) {
  const toggle = v => {
    if (single) return onChange([v]);
    if (v === 'none') return onChange(['none']);
    let next = value.includes(v) ? value.filter(x => x !== v) : [...value.filter(x => x !== 'none'), v];
    if (!next.length) next = options.some(([o]) => o === 'none') ? ['none'] : [];
    onChange(next);
  };
  return (
    <div className="tile-grid">
      {options.map(([v, label]) => (
        <button key={v} type="button" className={'qtile' + (value.includes(v) ? ' on' : '')} onClick={() => toggle(v)}>
          <span className="qtile-icon">{icons?.[v] ?? '•'}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function Chips({ options, value, onChange, danger }) {
  const toggle = v => {
    const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
    onChange(next);
  };
  return (
    <div className="chips">
      {options.map(([v, label]) => (
        <button key={v} type="button"
          className={'chip' + (value.includes(v) ? (danger ? ' on danger' : ' on') : '')}
          onClick={() => toggle(v)}>{label}</button>
      ))}
    </div>
  );
}

function Stepper({ label, sub, value, min, onChange }) {
  return (
    <div className="stepper-row">
      <span><strong>{label}</strong><span className="muted small"> {sub}</span></span>
      <span className="qty-stepper">
        <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <span>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}>+</button>
      </span>
    </div>
  );
}

export default function Quiz({ initial, onDone, onCancel }) {
  const [p, setP] = useState(initial);
  const [page, setPage] = useState(0);

  const setField = patch => setP(prev => ({ ...prev, ...patch }));

  const pages = [
    {
      title: 'Where do you shop?',
      sub: 'Every ingredient is matched to a real product at your supermarket, with live prices.',
      body: <>
        <div className="tile-grid one-col">
          {SUPERMARKETS.map(([v, label, tag]) => (
            <button key={v} type="button" className={'qtile row' + (p.supermarket === v ? ' on' : '')}
              onClick={() => setField({ supermarket: v })}>
              <span className="qtile-icon">🛒</span>
              <span><strong>{label}</strong><br /><span className="muted small">{tag}</span></span>
            </button>
          ))}
        </div>
        <div className="chips">
          {SUPERMARKETS_SOON.map(name => <span key={name} className="chip soon">{name} — coming soon</span>)}
        </div>
      </>,
    },
    {
      title: 'Who are we feeding?',
      sub: 'Portions and shopping quantities scale for the whole table — children eat smaller portions, so you buy less.',
      body: <div className="stepper-card">
        <Stepper label="Adults" sub="ages 13 and up" value={p.adults ?? 2} min={1} onChange={v => setField({ adults: v })} />
        <Stepper label="Children" sub="ages 2–12" value={p.children ?? 0} min={0} onChange={v => setField({ children: v })} />
        <Stepper label="Infants" sub="under 2" value={p.infants ?? 0} min={0} onChange={v => setField({ infants: v })} />
      </div>,
    },
    {
      title: 'Any allergies?',
      sub: 'Answer for everyone eating. These are strict: recipes containing them are removed completely.',
      body: <Chips danger options={ALLERGY_OPTIONS} value={p.allergies} onChange={v => setField({ allergies: v })} />,
    },
    {
      title: 'Any dietary requirements?',
      sub: 'Pick all that apply, for anyone at the table.',
      body: <Tiles options={DIET_OPTIONS} icons={DIET_ICONS} value={p.diet} onChange={v => setField({ diet: v })} />,
    },
    {
      title: 'Which foods do you enjoy?',
      sub: 'Suggestions lead with these. Leave empty to see everything.',
      body: <>
        <Tiles options={LIKE_OPTIONS} icons={LIKE_ICONS} value={p.likes} onChange={v => setField({ likes: v })} />
        <div className="chips">
          <button type="button" className={'chip' + (p.organicPref ? ' on' : '')}
            onClick={() => setField({ organicPref: !p.organicPref })}>
            Prefer organic {p.organicPref ? '✓' : ''}
          </button>
        </div>
        <p className="muted small">Organic usually costs more — your prices update honestly. It applies wherever
          your supermarket sells an organic version; everything else stays standard.</p>
      </>,
    },
    {
      title: 'Anything you just don’t like?',
      sub: 'Foods no one wants to see, separated by commas. Suggestions will quietly avoid them forever.',
      body: <input type="text" className="text-input" placeholder="e.g. mushrooms, olives, coriander"
        value={p.dislikes} onChange={e => setField({ dislikes: e.target.value })} />,
    },
    {
      title: 'How hungry is the table?',
      sub: 'Sets portion sizes. The protein boost makes every meal’s protein portion about a third bigger — good for training.',
      body: <>
        <div className="tile-grid three-col">
          {APPETITE_LEVELS.map((a, i) => (
            <button key={a[0]} type="button" className={'qtile' + ((p.appetite ?? 1) === i ? ' on' : '')}
              onClick={() => setField({ appetite: i })}>
              <span className="qtile-icon">{['🥄', '🍽️', '🍲'][i]}</span>
              <span>{a[0]}</span>
            </button>
          ))}
        </div>
        <div className="chips">
          <button type="button" className={'chip' + (p.proteinBoost ? ' on' : '')}
            onClick={() => setField({ proteinBoost: !p.proteinBoost })}>
            💪 High protein {p.proteinBoost ? '✓' : ''}
          </button>
        </div>
        <p className="muted small">Tip: most people pick 2–3 recipes and cook each for 2 nights — batch cooking
          is where the money and food-waste savings really come from.</p>
      </>,
    },
  ];

  if (page >= pages.length) {
    const dietLabel = p.diet.includes('none') ? 'no restrictions'
      : p.diet.map(d => DIET_OPTIONS.find(([v]) => v === d)?.[1]).filter(Boolean).join(', ');
    const household = [`${p.adults ?? 2} adult${(p.adults ?? 2) !== 1 ? 's' : ''}`,
      p.children ? `${p.children} child${p.children !== 1 ? 'ren' : ''}` : null,
      p.infants ? `${p.infants} infant${p.infants !== 1 ? 's' : ''}` : null].filter(Boolean).join(', ');
    return (
      <div className="panel">
        <p className="kicker">All set</p>
        <h2>Let’s find your week</h2>
        <p className="sub">Meals for {household} · {dietLabel}
          {p.allergies.length ? ` · strictly no ${p.allergies.join(', ')}` : ''} · shopping at
          {' '}{SUPERMARKETS.find(([v]) => v === p.supermarket)?.[1]}.
          Every suggestion respects the whole table, and every ingredient is priced.</p>
        <div className="nav-row">
          <button onClick={() => setPage(page - 1)}>Back</button>
          <button className="primary" onClick={() => onDone(p)}>Show my meal ideas</button>
        </div>
      </div>
    );
  }

  const q = pages[page];
  return (
    <div className="panel">
      <p className="kicker">Question {page + 1} of {pages.length}</p>
      <div className="progress"><div style={{ width: `${Math.round(((page + 1) / (pages.length + 1)) * 100)}%` }} /></div>
      <h2>{q.title}</h2>
      <p className="sub">{q.sub}</p>
      {q.body}
      <div className="nav-row">
        {page === 0 && onCancel
          ? <button onClick={onCancel}>Cancel</button>
          : <button disabled={page === 0} onClick={() => setPage(page - 1)}>Back</button>}
        <button className="primary" onClick={() => setPage(page + 1)}>
          {page === pages.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
