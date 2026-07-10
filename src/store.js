const KEY = 'mealprep-state-v1';

export const defaultState = () => ({
  onboarded: false,
  profile: {
    supermarket: 'ocado',
    people: 2,
    allergies: [],
    diet: ['none'],
    likes: [],
    dislikes: '',
    appetite: 1,        // 0 light, 1 standard, 2 hearty
    proteinBoost: false,
  },
  picked: [],       // dinners for the week: {id, qty} — qty = nights cooked-for
  customPicks: [],  // free-text ideas turned into recipes: {id, label}
  breakfasts: [],   // breakfast ids
  pantryOwned: [],  // pantry items the kitchen already has
});

// Older saves used per-person body stats and a dinners-count; fold them into the
// simpler shape without losing anything the new app still uses.
function migrate(s) {
  const d = defaultState();
  const profile = { ...d.profile, ...s.profile };
  if (Array.isArray(s.profile?.persons)) {
    profile.people = s.profile.persons.length || profile.people;
    delete profile.persons;
    delete profile.ndin;
  }
  const picked = (s.picked || []).map(p => (typeof p === 'string' ? { id: p, qty: 1 } : p));
  return { ...d, ...s, profile, picked };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
