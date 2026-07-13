import { useState, useRef, useEffect, useCallback } from 'react';
import { generateRecipes, recipeFromId, recipeFromText, methodSteps, estimatedTotal } from './engine.js';
import { DAILY_REF } from './data.js';
import { marketFor } from './supermarkets.js';

const ICONS = { meat: '🍗', fish: '🐟', egg: '🥚', plant: '🌱' };

function NutritionPanel({ recipe }) {
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
          <h4>Per portion</h4>
          <table>{rows.map(([k, v]) => <tbody key={k}><tr><td>{k}</td><td>{v}</td></tr></tbody>)}</table>
          <h4>Micronutrients</h4>
          <table>{micros.map(([k, v, u, ref]) => (
            <tbody key={k}><tr><td>{k}</td><td>{Math.round(v * 10) / 10} {u} <span className="muted">({Math.round((v / ref) * 100)}% daily)</span></td></tr></tbody>
          ))}</table>
        </div>
        <div>
          <h4>Method</h4>
          <ol>{methodSteps(recipe).map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      </div>
    </div>
  );
}

const PAGE = 24;

export default function Browser({ profile, picked, setPicked, customPicks, setCustomPicks, breakfasts, pantryOwned,
  listTweaks, extras, favourites, setFavourites, onShowList, onChangeShop, onClearWeek }) {
  const [shown, setShown] = useState([]);
  const [idea, setIdea] = useState('');
  const [ideaMiss, setIdeaMiss] = useState(false);
  const [openId, setOpenId] = useState(null);
  const cursorRef = useRef(0);

  const refresh = useCallback((reset = false) => {
    const { recipes, cursor } = generateRecipes(profile, reset ? 0 : cursorRef.current, PAGE);
    cursorRef.current = cursor;
    setShown(recipes);
  }, [profile]);

  useEffect(() => { refresh(true); }, [refresh]);

  const isFav = id => (favourites || []).includes(id);
  const toggleFav = id => setFavourites(isFav(id) ? favourites.filter(f => f !== id) : [...favourites, id]);

  const qtyOf = id => picked.find(p => p.id === id)?.qty || 0;
  const setQty = (id, qty) => {
    if (qty <= 0) setPicked(picked.filter(p => p.id !== id));
    else if (qtyOf(id)) setPicked(picked.map(p => (p.id === id ? { ...p, qty } : p)));
    else setPicked([...picked, { id, qty }]);
  };

  const addIdea = () => {
    const text = idea.trim();
    if (!text) return;
    const r = recipeFromText(text, profile);
    if (!r) { setIdeaMiss(true); return; }
    setIdeaMiss(false);
    setCustomPicks([{ id: r.id, label: text }, ...customPicks.filter(c => c.id !== r.id)]);
    setIdea('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const customRecipes = customPicks
    .map(c => { const r = recipeFromId(c.id, profile); return r ? { ...r, customLabel: c.label } : null; })
    .filter(Boolean);

  // Picked recipes stay pinned at the top so refreshing never loses them.
  const customIds = new Set(customPicks.map(c => c.id));
  const pinnedPicked = picked
    .filter(p => !customIds.has(p.id))
    .map(p => recipeFromId(p.id, profile))
    .filter(Boolean);
  // favourites float to the front of the browseable pool
  const browseable = shown.filter(r => !qtyOf(r.id) && !customIds.has(r.id))
    .sort((a, b) => (isFav(b.id) ? 1 : 0) - (isFav(a.id) ? 1 : 0));

  const totalNights = picked.reduce((s, p) => s + p.qty, 0);
  const estimate = totalNights ? estimatedTotal(profile, picked, breakfasts || [], pantryOwned || [], null, listTweaks, extras) : 0;
  const market = marketFor(profile);

  const card = (r, custom) => {
    const qty = qtyOf(r.id);
    return (
      <div key={(custom ? 'c-' : '') + r.id} className={'meal-card' + (qty ? ' picked' : '')}>
        <div className={`tile ${r.icon}`}>
          <span>{ICONS[r.icon]}</span>
          <img src={`${import.meta.env.BASE_URL}photos/${r.id}.jpg`} alt="" loading="lazy"
            onError={e => e.currentTarget.remove()} />
        </div>
        <div className="meal-body">
          {custom && <p className="your-idea">Your idea: “{r.customLabel}”</p>}
          <p className="meal-name">{r.name}</p>
          <p className="muted small">{r.blurb}</p>
          <p className="muted small">~{r.mins} min · {Math.round(r.perServing.kcal)} kcal · {Math.round(r.perServing.prot)}g protein
            {r.costPerServing > 0 && <> · <strong>≈ £{r.costPerServing.toFixed(2)} a portion</strong></>}</p>
          {qty > 0 && <p className="nights">Cook once, eat {qty} night{qty > 1 ? 's' : ''}</p>}
          <div className="card-actions">
            {qty === 0
              ? <button onClick={() => setQty(r.id, 1)}>Pick</button>
              : <span className="qty-stepper">
                  <button onClick={() => setQty(r.id, qty - 1)}>−</button>
                  <span>{qty} night{qty > 1 ? 's' : ''}</span>
                  <button onClick={() => setQty(r.id, qty + 1)}>+</button>
                </span>}
            <button onClick={() => setOpenId(openId === r.id ? null : r.id)}>{openId === r.id ? 'Hide info' : 'Nutrition & method'}</button>
            <button className={'fav' + (isFav(r.id) ? ' on' : '')} title={isFav(r.id) ? 'Remove from favourites' : 'Add to favourites'}
              onClick={() => toggleFav(r.id)}>{isFav(r.id) ? '♥' : '♡'}</button>
          </div>
        </div>
        {openId === r.id && <NutritionPanel recipe={r} />}
      </div>
    );
  };

  return (
    <div>
      <h2>Meal ideas for your week</h2>
      <p className="sub">Pick your dinners for {profile.people} {profile.people > 1 ? 'people' : 'person'}. Want a meal
        two nights running? Press + and cook it once. Or describe anything you fancy.</p>
      <div className="picks-bar">
        <button className="shop-badge" onClick={onChangeShop} title="Change supermarket in Settings">
          🛒 {market.store}{profile.organicPref ? ' · organic' : ''}
        </button>
        <span>{totalNights
          ? <>{picked.length} recipe{picked.length > 1 ? 's' : ''} · {totalNights} dinner{totalNights > 1 ? 's' : ''} · est. £{estimate.toFixed(2)}</>
          : 'No recipes picked yet — tap Pick on any meal'}</span>
        {totalNights > 0 && (
          <button className="primary" onClick={onShowList}>Shopping list →</button>
        )}
      </div>
      <div className="idea-row">
        <input type="text" className="text-input" value={idea}
          placeholder="Type anything… e.g. slow-cooked beef with sweet potato"
          onChange={e => { setIdea(e.target.value); setIdeaMiss(false); }}
          onKeyDown={e => e.key === 'Enter' && addIdea()} />
        <button className="primary" onClick={addIdea}>Create recipe</button>
      </div>
      {ideaMiss && <p className="idea-miss">Nothing in the library is close to that yet — try naming a
        protein or a dish style (“prawn stir-fry”, “beef chilli”). Live AI recipe creation is coming.</p>}
      <div className="meal-grid">
        {customRecipes.map(r => card(r, true))}
        {pinnedPicked.map(r => card(r, false))}
        {browseable.map(r => card(r, false))}
      </div>
      <div className="center">
        <button className="primary" onClick={() => refresh()}>Refresh — {PAGE} fresh ideas</button>
        {totalNights > 0 && <button className="ghost" onClick={onClearWeek}>Start a new week</button>}
      </div>
    </div>
  );
}
