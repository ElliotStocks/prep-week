import { useState } from 'react';
import { ALLERGY_OPTIONS, DIET_OPTIONS, LIKE_OPTIONS, SUPERMARKETS, SUPERMARKETS_SOON, APPETITE_LEVELS } from './data.js';

function Chips({ options, value, onChange, single, danger }) {
  const toggle = v => {
    if (single) return onChange([v]);
    if (v === 'none') return onChange(['none']);
    let next = value.includes(v) ? value.filter(x => x !== v) : [...value.filter(x => x !== 'none'), v];
    if (!next.length) next = options.some(([o]) => o === 'none') ? ['none'] : [];
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

function Slider({ label, min, max, value, unit, onChange }) {
  return (
    <div className="srow">
      <label>{label}</label>
      <input type="range" min={min} max={max} step="1" value={value}
        onChange={e => onChange(+e.target.value)} />
      <output>{value}{unit}</output>
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
        <Chips single options={SUPERMARKETS} value={[p.supermarket]} onChange={([v]) => setField({ supermarket: v })} />
        <div className="chips">
          {SUPERMARKETS_SOON.map(name => <span key={name} className="chip soon">{name} — coming soon</span>)}
        </div>
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
      title: 'How many people are eating?',
      sub: 'Every portion and shopping quantity is scaled for this.',
      body: <Slider label="People eating" min={1} max={6} value={p.people} unit="" onChange={v => setField({ people: v })} />,
    },
    {
      title: 'Any allergies?',
      sub: 'Answer for everyone eating. These are strict: recipes containing them are removed completely.',
      body: <Chips danger options={ALLERGY_OPTIONS} value={p.allergies} onChange={v => setField({ allergies: v })} />,
    },
    {
      title: 'Any dietary requirements?',
      sub: 'Pick all that apply, for anyone at the table.',
      body: <Chips options={DIET_OPTIONS} value={p.diet} onChange={v => setField({ diet: v })} />,
    },
    {
      title: 'Which foods do you enjoy?',
      sub: 'Suggestions lead with these. Leave empty to see everything.',
      body: <Chips options={LIKE_OPTIONS} value={p.likes} onChange={v => setField({ likes: v })} />,
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
        <Chips single options={APPETITE_LEVELS.map((a, i) => [String(i), a[0]])}
          value={[String(p.appetite)]} onChange={([v]) => setField({ appetite: +v })} />
        <div className="chips">
          <button type="button" className={'chip' + (p.proteinBoost ? ' on' : '')}
            onClick={() => setField({ proteinBoost: !p.proteinBoost })}>
            High protein {p.proteinBoost ? '✓' : ''}
          </button>
        </div>
      </>,
    },
  ];

  if (page >= pages.length) {
    const dietLabel = p.diet.includes('none') ? 'no restrictions'
      : p.diet.map(d => DIET_OPTIONS.find(([v]) => v === d)?.[1]).filter(Boolean).join(', ');
    return (
      <div className="panel">
        <p className="kicker">All set</p>
        <h2>Let’s find your week</h2>
        <p className="sub">Meals for {p.people} {p.people > 1 ? 'people' : 'person'} · {dietLabel}
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
