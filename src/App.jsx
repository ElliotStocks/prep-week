import { useState, useEffect } from 'react';
import Quiz, { QUIZ_QUESTION_COUNT } from './Quiz.jsx';
import Browser from './Browser.jsx';
import Breakfasts from './Breakfasts.jsx';
import Stock from './Stock.jsx';
import Cook from './Cook.jsx';
import Extras from './Extras.jsx';
import { EXTRAS } from './extras.js';
import { loadState, saveState } from './store.js';
import { allowedDishes, recipeFromId } from './engine.js';
import { BREAKFASTS } from './data.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Once a week, ask how the cooked meals were. One tap per meal, always skippable,
// never nags: the timer arms when a week has picks, fires 7 days later.
function RatingCard({ picked, profile, ratings, onRate, onDone }) {
  const meals = picked.map(p => recipeFromId(p.id, profile)).filter(Boolean)
    .filter(r => !ratings[r.id]);
  if (!meals.length) return null;
  return (
    <div className="rating-card">
      <div className="rating-head">
        <strong>How were your meals?</strong>
        <button className="link" onClick={onDone}>Skip</button>
      </div>
      <p className="muted small">A quick thumbs helps next week’s ideas get better. Stays on this device.</p>
      {meals.map(r => (
        <div key={r.id} className="rating-row">
          <span>{r.name}</span>
          <span>
            <button className="thumb" aria-label={`Liked ${r.name}`} onClick={() => onRate(r.id, 1)}>👍</button>
            <button className="thumb" aria-label={`Not for us: ${r.name}`} onClick={() => onRate(r.id, -1)}>👎</button>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('meals');
  const [mealsView, setMealsView] = useState('dinners');
  const [editing, setEditing] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const patch = p => setState(prev => ({ ...prev, ...p }));

  // arm the weekly rating timer the first time a week has picks
  useEffect(() => {
    if (state.picked.length && !state.ratingPromptedAt) patch({ ratingPromptedAt: Date.now() });
  }, [state.picked.length, state.ratingPromptedAt]);

  const ratingDue = state.picked.length > 0 && state.ratingPromptedAt
    && Date.now() - state.ratingPromptedAt > WEEK_MS;
  const rateMeal = (id, score) => {
    const ratings = { ...state.ratings, [id]: { score, ratedAt: Date.now() } };
    const allRated = state.picked.every(p => ratings[p.id]);
    patch({ ratings, ...(allRated ? { ratingPromptedAt: Date.now() } : {}) });
  };
  const ratingDone = () => patch({ ratingPromptedAt: Date.now() });

  const clearWeek = () => {
    if (!window.confirm('Start a new week? This clears your picked meals, breakfasts, extras and list edits. Your profile, favourites and cupboard memory stay.')) return;
    patch({ picked: [], customPicks: [], breakfasts: [], listTweaks: { skipped: [], packs: {} }, extras: [] });
    setTab('meals');
  };

  if (!state.onboarded && !welcomed) {
    return (
      <div className="shell">
        <header className="app-header"><h1>Stocked</h1></header>
        <div className="welcome">
          <div className="welcome-hero">
            <img src={`${import.meta.env.BASE_URL}photos/chicken-shawarma-bowls.jpg`} alt="" />
            <img src={`${import.meta.env.BASE_URL}photos/pesto-salmon-traybake.jpg`} alt="" />
            <img src={`${import.meta.env.BASE_URL}photos/gnocchi-tomato-traybake.jpg`} alt="" />
          </div>
          <h2>Your week’s meals and shopping, sorted.</h2>
          <p className="sub">Real recipes with real supermarket prices. Pick your dinners, get the whole
            week’s shopping list — priced to the penny at your supermarket. No account needed.</p>
          <button className="primary big" onClick={() => setWelcomed(true)}>Get started</button>
          <p className="muted small">{['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][QUIZ_QUESTION_COUNT - 1] ?? QUIZ_QUESTION_COUNT} quick questions, then straight to the food.</p>
        </div>
      </div>
    );
  }

  if (!state.onboarded || editing) {
    return (
      <div className="shell">
        <header className="app-header"><h1>Stocked</h1></header>
        <Quiz
          initial={state.profile}
          onCancel={editing ? () => setEditing(false) : undefined}
          onDone={profile => {
            // keep the week's picks across settings edits — only drop anything the
            // new answers rule out (allergies, diet)
            const okIds = new Set(allowedDishes(profile).map(d => d.id));
            const okBf = new Set(BREAKFASTS.filter(b => !b.allergens.some(a => profile.allergies.includes(a))).map(b => b.id));
            patch({
              profile,
              onboarded: true,
              picked: state.picked.filter(p => okIds.has(p.id)),
              customPicks: state.customPicks.filter(c => okIds.has(c.id)),
              breakfasts: state.breakfasts.filter(id => okBf.has(id)),
            });
            setEditing(false);
            setTab('meals');
          }}
        />
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="app-header">
        <h1>Stocked</h1>
        <nav>
          {[['meals', 'Meals'], ['stock', 'Shopping list'], ['cook', 'Cooking']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'tab on' : 'tab'} onClick={() => setTab(id)}>{label}</button>
          ))}
          <button className="tab gear" aria-label="Settings" title="Settings" onClick={() => setEditing(true)}>⚙</button>
        </nav>
      </header>
      {tab === 'meals' && (
        <>
          {ratingDue && (
            <RatingCard picked={state.picked} profile={state.profile} ratings={state.ratings}
              onRate={rateMeal} onDone={ratingDone} />
          )}
          <div className="seg">
            <button className={mealsView === 'dinners' ? 'on' : ''} onClick={() => setMealsView('dinners')}>Dinners</button>
            <button className={mealsView === 'breakfasts' ? 'on' : ''} onClick={() => setMealsView('breakfasts')}>
              Breakfasts{state.breakfasts.length > 0 ? ` · ${state.breakfasts.length}` : ''}
            </button>
            <button className={mealsView === 'favourites' ? 'on' : ''} onClick={() => setMealsView('favourites')}>
              ♥ Favourites{state.favourites.length > 0 ? ` · ${state.favourites.length}` : ''}
            </button>
            {[['snacks', 'Snacks'], ['essentials', 'Essentials']].map(([cat, label]) => {
              const count = state.extras.filter(e => EXTRAS[cat].includes(e.name)).length;
              return (
                <button key={cat} className={mealsView === cat ? 'on' : ''} onClick={() => setMealsView(cat)}>
                  {label}{count > 0 ? ` · ${count}` : ''}
                </button>
              );
            })}
          </div>
          {(mealsView === 'snacks' || mealsView === 'essentials') && (
            <Extras
              category={mealsView}
              profile={state.profile}
              extras={state.extras}
              setExtras={updater => setState(prev => ({
                ...prev,
                extras: typeof updater === 'function' ? updater(prev.extras) : updater,
              }))}
            />
          )}
          {(mealsView === 'dinners' || mealsView === 'favourites') && (
            <Browser
              profile={state.profile}
              picked={state.picked}
              setPicked={picked => patch({ picked })}
              customPicks={state.customPicks}
              setCustomPicks={customPicks => patch({ customPicks })}
              breakfasts={state.breakfasts}
              pantryOwned={state.pantryOwned}
              listTweaks={state.listTweaks}
              extras={state.extras}
              favourites={state.favourites}
              setFavourites={favourites => patch({ favourites })}
              onShowList={() => setTab('stock')}
              onChangeShop={() => setEditing(true)}
              onClearWeek={clearWeek}
              favouritesOnly={mealsView === 'favourites'}
              ratings={state.ratings}
            />
          )}
          {mealsView === 'breakfasts' && (
            <Breakfasts
              profile={state.profile}
              breakfasts={state.breakfasts}
              setBreakfasts={breakfasts => patch({ breakfasts })}
            />
          )}
        </>
      )}
      {tab === 'cook' && (
        <Cook profile={state.profile} picked={state.picked} />
      )}
      {tab === 'stock' && (
        <Stock
          profile={state.profile}
          picked={state.picked}
          breakfasts={state.breakfasts}
          pantryOwned={state.pantryOwned}
          setPantryOwned={pantryOwned => patch({ pantryOwned })}
          listTweaks={state.listTweaks}
          setListTweaks={listTweaks => patch({ listTweaks })}
          extras={state.extras}
          setExtras={updater => setState(prev => ({
            ...prev,
            extras: typeof updater === 'function' ? updater(prev.extras) : updater,
          }))}
          onClearWeek={clearWeek}
        />
      )}
    </div>
  );
}
