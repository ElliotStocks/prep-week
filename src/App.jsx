import { useState, useEffect } from 'react';
import Quiz from './Quiz.jsx';
import Browser from './Browser.jsx';
import Breakfasts from './Breakfasts.jsx';
import Stock from './Stock.jsx';
import Cook from './Cook.jsx';
import Extras from './Extras.jsx';
import { EXTRAS } from './extras.js';
import { loadState, saveState } from './store.js';
import { allowedDishes } from './engine.js';
import { BREAKFASTS } from './data.js';

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('meals');
  const [mealsView, setMealsView] = useState('dinners');
  const [editing, setEditing] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const patch = p => setState(prev => ({ ...prev, ...p }));

  const clearWeek = () => {
    if (!window.confirm('Start a new week? This clears your picked meals, breakfasts, extras and list edits. Your profile, favourites and cupboard memory stay.')) return;
    patch({ picked: [], customPicks: [], breakfasts: [], listTweaks: { skipped: [], packs: {} }, extras: [] });
    setTab('meals');
  };

  if (!state.onboarded && !welcomed) {
    return (
      <div className="shell">
        <header className="app-header"><h1>Prep Week</h1></header>
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
          <p className="muted small">Seven quick questions, then straight to the food.</p>
        </div>
      </div>
    );
  }

  if (!state.onboarded || editing) {
    return (
      <div className="shell">
        <header className="app-header"><h1>Prep Week</h1></header>
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
        <h1>Prep Week</h1>
        <nav>
          {[['meals', 'Meals'], ['stock', 'Shopping list'], ['cook', 'Cooking']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'tab on' : 'tab'} onClick={() => setTab(id)}>{label}</button>
          ))}
          <button className="tab gear" aria-label="Settings" title="Settings" onClick={() => setEditing(true)}>⚙</button>
        </nav>
      </header>
      {tab === 'meals' && (
        <>
          <div className="seg">
            <button className={mealsView === 'dinners' ? 'on' : ''} onClick={() => setMealsView('dinners')}>Dinners</button>
            <button className={mealsView === 'breakfasts' ? 'on' : ''} onClick={() => setMealsView('breakfasts')}>
              Breakfasts{state.breakfasts.length > 0 ? ` · ${state.breakfasts.length}` : ''}
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
          {mealsView === 'dinners' && (
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
