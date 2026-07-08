import { useState, useEffect } from 'react';
import Quiz from './Quiz.jsx';
import Browser from './Browser.jsx';
import Breakfasts from './Breakfasts.jsx';
import Stock from './Stock.jsx';
import { loadState, saveState } from './store.js';

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('meals');
  const [editing, setEditing] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const patch = p => setState(prev => ({ ...prev, ...p }));

  if (!state.onboarded || editing) {
    return (
      <div className="shell">
        <header className="app-header"><h1>Prep Week</h1></header>
        <Quiz
          initial={state.profile}
          onCancel={editing ? () => setEditing(false) : undefined}
          onDone={profile => {
            patch({ profile, onboarded: true, picked: [], customPicks: [], breakfasts: [] });
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
          {[['meals', 'Meals'], ['breakfasts', 'Breakfasts'], ['stock', 'Shopping list']].map(([id, label]) => (
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
        />
      )}
      {tab === 'breakfasts' && (
        <Breakfasts
          profile={state.profile}
          breakfasts={state.breakfasts}
          setBreakfasts={breakfasts => patch({ breakfasts })}
        />
      )}
      {tab === 'stock' && (
        <Stock
          profile={state.profile}
          picked={state.picked}
          breakfasts={state.breakfasts}
          pantryOwned={state.pantryOwned}
          setPantryOwned={pantryOwned => patch({ pantryOwned })}
        />
      )}
    </div>
  );
}
