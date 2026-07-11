import { useState, useEffect } from 'react';
import Quiz from './Quiz.jsx';
import Browser from './Browser.jsx';
import Breakfasts from './Breakfasts.jsx';
import Stock from './Stock.jsx';
import Cook from './Cook.jsx';
import { loadState, saveState } from './store.js';
import { allowedDishes } from './engine.js';
import { BREAKFASTS } from './data.js';

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('meals');
  const [editing, setEditing] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const patch = p => setState(prev => ({ ...prev, ...p }));

  const clearWeek = () => {
    if (!window.confirm('Start a new week? This clears your picked meals, breakfasts and list edits. Your profile, favourites and cupboard memory stay.')) return;
    patch({ picked: [], customPicks: [], breakfasts: [], listTweaks: { skipped: [], packs: {} } });
    setTab('meals');
  };

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
          {[['meals', 'Meals'], ['breakfasts', 'Breakfasts'], ['stock', 'Shopping list'], ['cook', 'Cooking']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'tab on' : 'tab'} onClick={() => setTab(id)}>{label}</button>
          ))}
          <button className="tab" onClick={() => setEditing(true)}>Settings</button>
        </nav>
      </header>
      {tab === 'meals' && (
        <Browser
          profile={state.profile}
          picked={state.picked}
          setPicked={picked => patch({ picked })}
          customPicks={state.customPicks}
          setCustomPicks={customPicks => patch({ customPicks })}
          breakfasts={state.breakfasts}
          pantryOwned={state.pantryOwned}
          listTweaks={state.listTweaks}
          favourites={state.favourites}
          setFavourites={favourites => patch({ favourites })}
          onShowList={() => setTab('stock')}
          onChangeShop={() => setEditing(true)}
          onClearWeek={clearWeek}
        />
      )}
      {tab === 'breakfasts' && (
        <Breakfasts
          profile={state.profile}
          breakfasts={state.breakfasts}
          setBreakfasts={breakfasts => patch({ breakfasts })}
        />
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
          onClearWeek={clearWeek}
        />
      )}
    </div>
  );
}
