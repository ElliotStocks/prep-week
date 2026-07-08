import { useState } from 'react';
import { ALLERGY_OPTIONS, DIET_OPTIONS, LIKE_OPTIONS, ACTIVITY_LEVELS } from './data.js';
import { personTargets } from './engine.js';
import { newPerson } from './store.js';

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
  const setPeople = n => setP(prev => {
    const persons = [...prev.persons];
    while (persons.length < n) persons.push(newPerson());
    persons.length = n;
    return { ...prev, people: n, persons };
  });
  const setPerson = (i, patch) => setP(prev => {
    const persons = prev.persons.map((pp, x) => (x === i ? { ...pp, ...patch } : pp));
    return { ...prev, persons };
  });

  const pages = [];
  pages.push({
    title: 'Who are we feeding?',
    sub: 'How many people are the meals for? Every portion and shopping quantity is scaled for this, and we’ll ask a few questions about each person so everyone’s meals are the right size.',
    body: <Slider label="People eating" min={1} max={6} value={p.people} unit="" onChange={setPeople} />,
  });
  p.persons.forEach((pp, i) => {
    const you = i === 0;
    const name = you ? 'you' : `person ${i + 1}`;
    const badge = p.people > 1 ? <span className="pbadge">{you ? 'You' : `Person ${i + 1}`}</span> : null;
    pages.push({
      title: you ? 'How old are you?' : `How old is ${name}?`,
      sub: `Age changes how many calories ${you ? 'your body needs' : 'they need'} each day.`,
      body: <>{badge}<Slider label="Age" min={4} max={90} value={pp.age} unit=" yrs" onChange={v => setPerson(i, { age: v })} /></>,
    });
    pages.push({
      title: you ? 'How do you describe yourself?' : `How does ${name} describe themselves?`,
      sub: 'Used only to make the calorie calculation more accurate.',
      body: <>{badge}<Chips single options={[['f', 'Female'], ['m', 'Male'], ['na', 'Prefer not to say']]}
        value={[pp.gender]} onChange={([v]) => setPerson(i, { gender: v })} /></>,
    });
    pages.push({
      title: you ? 'Your body stats' : `Body stats for ${name}`,
      sub: 'Weight and height set daily calorie and protein targets. Everything stays on this device.',
      body: <>{badge}
        <Slider label="Weight" min={15} max={180} value={pp.weight} unit=" kg" onChange={v => setPerson(i, { weight: v })} />
        <Slider label="Height" min={90} max={210} value={pp.height} unit=" cm" onChange={v => setPerson(i, { height: v })} /></>,
    });
    pages.push({
      title: you ? 'How active are you?' : `How active is ${name}?`,
      sub: 'A desk job and a building site burn very different amounts of energy.',
      body: <>{badge}<Chips single options={ACTIVITY_LEVELS.map((a, x) => [String(x), a[0]])}
        value={[String(pp.activity)]} onChange={([v]) => setPerson(i, { activity: +v })} /></>,
    });
    pages.push({
      title: you ? 'What’s your goal?' : `What’s ${name}’s goal?`,
      sub: 'Nudges calories down, level, or up, and sets daily protein.',
      body: <>{badge}<Chips single options={[['lose', 'Lose fat'], ['maintain', you ? 'Stay as I am' : 'Stay as they are'], ['build', 'Build muscle']]}
        value={[pp.goal]} onChange={([v]) => setPerson(i, { goal: v })} /></>,
    });
  });
  pages.push({
    title: 'Any allergies?',
    sub: 'Answer for everyone eating. These are strict: recipes and supermarket products containing them are removed completely.',
    body: <Chips danger options={ALLERGY_OPTIONS} value={p.allergies} onChange={v => setField({ allergies: v })} />,
  });
  pages.push({
    title: 'Any dietary requirements?',
    sub: 'Pick all that apply, for anyone at the table.',
    body: <Chips options={DIET_OPTIONS} value={p.diet} onChange={v => setField({ diet: v })} />,
  });
  pages.push({
    title: 'Which whole foods do you enjoy?',
    sub: 'Suggestions are built around these. Leave empty to see everything.',
    body: <Chips options={LIKE_OPTIONS} value={p.likes} onChange={v => setField({ likes: v })} />,
  });
  pages.push({
    title: 'Anything you just don’t like?',
    sub: 'Foods no one wants to see, separated by commas. Suggestions will quietly avoid them forever.',
    body: <input type="text" className="text-input" placeholder="e.g. mushrooms, olives, coriander"
      value={p.dislikes} onChange={e => setField({ dislikes: e.target.value })} />,
  });
  pages.push({
    title: 'How many dinners should we cover?',
    sub: 'That’s the whole quiz. How many recipes to batch-cook is up to you when you pick your meals; we’ll spread these dinners across whatever you choose.',
    body: <Slider label="Dinners to cover" min={3} max={7} value={p.ndin} unit="" onChange={v => setField({ ndin: v })} />,
  });

  if (page >= pages.length) {
    return (
      <div className="panel">
        <p className="kicker">Your household profile</p>
        <h2>Here’s what we’ll aim for</h2>
        <p className="sub">A target for each person, built from their own answers. Shared meals are scaled so everyone
          gets the right portion, and every suggestion respects the whole table’s allergies, requirements and dislikes.</p>
        <div className="target-grid">
          {p.persons.map((pp, i) => {
            const t = personTargets(pp);
            return (
              <div className="target-card" key={i}>
                <p className="muted">{i === 0 ? 'You' : `Person ${i + 1}`}</p>
                <p className="big">{t.kcal.toLocaleString()} kcal</p>
                <p className="muted">{t.prot}g protein / day</p>
              </div>
            );
          })}
        </div>
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
