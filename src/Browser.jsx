import { useState, useRef, useEffect, useCallback } from 'react';
import { generateRecipes, recipeFromId, recipeFromText, methodSteps, personTargets, personScale } from './engine.js';
import { DAILY_REF } from './data.js';

const ICONS = { meat: '🍗', fish: '🐟', egg: '🥚', plant: '🌱' };

function NutritionPanel({ recipe, profile }) {
  const n = recipe.perServing;
  const rows = [
    ['Calories', `${Math.round(n.kcal)} kcal`],
    ['Protein', `${Math.round(n.prot)} g`],
    ['Carbohydrates', `${Math.round(n.carb)} g`],
    ['Fat', `${Math.round(n.fat)} g`],
  ];
  const micros = [
    ['Fibre', n.fibre, 'g', DAILY_REF.fibre],
    ['Iron', n.iron, 'mg', DAILY_REF.iron],
    ['Calcium', n.calcium, 'mg', DAILY_REF.calcium],
    ['Vitamin C', n.vitc, 'mg', DAILY_REF.vitc],
    ['Potassium', n.potassium, 'mg', DAILY_REF.potassium],
  ];
  return (
    <div className="detail">
      <div className="detail-cols">
        <div>
          <h4>Per reference serving</h4>
          <table>{rows.map(([k, v]) => <tbody key={k}><tr><td>{k}</td><td>{v}</td></tr></tbody>)}</table>
          <h4>Micronutrients</h4>
          <table>{micros.map(([k, v, u, ref]) => (
            <tbody key={k}><tr><td>{k}</td><td>{Math.round(v * 10) / 10} {u} <span className="muted">({Math.round((v / ref) * 100)}% daily)</span></td></tr></tbody>
          ))}</table>
        </div>
        <div>
          <h4>Portions</h4>
          <ul className="plain">
            {profile.persons.map((p, i) => {
              const s = personScale(p);
              const t = personTargets(p);
              return <li key={i}>{i === 0 ? 'You' : `Person ${i + 1}`}: ×{s.toFixed(2)} serving
                ≈ {Math.round(n.kcal * s)} kcal, {Math.round(n.prot * s)}g protein
                <span className="muted"> (target {t.kcal.toLocaleString()} kcal/day)</span></li>;
            })}
          </ul>
          <h4>Method</h4>
          <ol>{methodSteps(recipe).map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      </div>
    </div>
  );
}

export default function Browser({ profile, picked, setPicked, customPicks, setCustomPicks }) {
  const [shown, setShown] = useState([]);
  const [idea, setIdea] = useState('');
  const [openId, setOpenId] = useState(null);
  const cursorRef = useRef(0);

  const refill = useCallback(() => {
    cursorRef.current = 0;
    const { recipes, cursor } = generateRecipes(profile, 0, 8);
    cursorRef.current = cursor;
    setShown(recipes);
  }, [profile]);

  useEffect(() => { refill(); }, [refill]);

  const more = () => {
    const { recipes, cursor } = generateRecipes(profile, cursorRef.current, 8);
    cursorRef.current = cursor;
    setShown(prev => {
      const have = new Set(prev.map(r => r.id));
      return [...prev, ...recipes.filter(r => !have.has(r.id))];
    });
  };

  const togglePick = id => {
    setPicked(picked.includes(id) ? picked.filter(x => x !== id) : [...picked, id]);
  };

  const addIdea = () => {
    const text = idea.trim();
    if (!text) return;
    const r = recipeFromText(text, profile);
    if (!r) return;
    setCustomPicks([{ id: r.id, label: text }, ...customPicks.filter(c => c.id !== r.id)]);
    setIdea('');
  };

  const customRecipes = customPicks
    .map(c => { const r = recipeFromId(c.id); return r ? { ...r, customLabel: c.label } : null; })
    .filter(Boolean);

  const atCap = picked.length >= profile.ndin;
  const nightsFor = id => {
    const i = picked.indexOf(id);
    if (i < 0) return 0;
    const base = Math.floor(profile.ndin / picked.length);
    return base + (i < profile.ndin % picked.length ? 1 : 0);
  };

  const card = (r, custom) => {
    const on = picked.includes(r.id);
    return (
      <div key={(custom ? 'c-' : '') + r.id} className={'meal-card' + (on ? ' picked' : '')}>
        <div className={`tile ${r.protein.icon}`}><span>{ICONS[r.protein.icon]}</span></div>
        <div className="meal-body">
          {custom && <p className="your-idea">Your idea: “{r.customLabel}”</p>}
          <p className="meal-name">{r.name}</p>
          <p className="muted small">{r.method.name} · ~{r.mins} min · {Math.round(r.perServing.kcal)} kcal · {Math.round(r.perServing.prot)}g protein</p>
          {on && <p className="nights">Cook once, eat {nightsFor(r.id)} night{nightsFor(r.id) > 1 ? 's' : ''}</p>}
          <div className="card-actions">
            <button disabled={!on && atCap} onClick={() => togglePick(r.id)}>{on ? 'Picked ✓' : 'Pick'}</button>
            <button onClick={() => setOpenId(openId === r.id ? null : r.id)}>{openId === r.id ? 'Hide info' : 'Nutrition & method'}</button>
          </div>
        </div>
        {openId === r.id && <NutritionPanel recipe={r} profile={profile} />}
      </div>
    );
  };

  return (
    <div>
      <div className="row-between">
        <h2>Meal ideas for your week</h2>
        <span className="muted small">
          Daily targets: {profile.persons.map((p, i) => `${i === 0 ? 'You' : 'P' + (i + 1)} ${personTargets(p).kcal.toLocaleString()}`).join(' · ')} kcal
        </span>
      </div>
      <p className="sub">Pick as many or as few recipes as you like; your {profile.ndin} dinners are spread across them
        and everyone’s portions are scaled. Or describe anything you fancy.</p>
      <div className="idea-row">
        <input type="text" className="text-input" value={idea}
          placeholder="Type anything… e.g. slow-cooked beef with sweet potato"
          onChange={e => setIdea(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addIdea()} />
        <button className="primary" onClick={addIdea}>Create recipe</button>
      </div>
      <div className="meal-grid">
        {customRecipes.map(r => card(r, true))}
        {shown.map(r => card(r, false))}
      </div>
      <div className="center">
        <button onClick={more}>More ideas — it never runs out</button>
      </div>
      <div className="footer-bar">
        <span>{picked.length
          ? `${picked.length} recipe${picked.length > 1 ? 's' : ''} picked · covering ${profile.ndin} dinners`
          : 'No recipes picked yet'}</span>
      </div>
    </div>
  );
}
