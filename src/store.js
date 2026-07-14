const KEY = 'mealprep-state-v1';

export const defaultState = () => ({
  onboarded: false,
  profile: {
    supermarket: 'ocado',
    adults: 2,        // ages 13+
    children: 0,      // ages 2-12 (0.6 of an adult portion)
    infants: 0,       // under 2 (0.25 of an adult portion)
    allergies: [],
    diet: ['none'],
    likes: [],
    dislikes: '',
    appetite: 1,        // 0 light, 1 standard, 2 hearty
    proteinBoost: false,
    organicPref: false, // prefer organic products where the supermarket has them
  },
  picked: [],       // dinners for the week: {id, qty} — qty = nights cooked-for
  customPicks: [],  // free-text ideas turned into recipes: {id, label}
  breakfasts: [],   // breakfast ids
  pantryOwned: [],  // pantry items the kitchen already has
  favourites: [],   // dish ids the user hearts — float to the top of the browser
  // per-week shopping list edits: lines removed, pack counts reduced, products swapped
  listTweaks: { skipped: [], packs: {}, swaps: {} },
  extras: [],       // snacks & essentials added to this week's list: {name, packs}
});

// Older saves used per-person body stats and a dinners-count; fold them into the
// simpler shape without losing anything the new app still uses.
function migrate(s) {
  const d = defaultState();
  const profile = { ...d.profile, ...s.profile };
  if (Array.isArray(s.profile?.persons)) {
    profile.people = s.profile.persons.length;
    delete profile.persons;
    delete profile.ndin;
  }
  // people count (flat) → age-banded household
  if (profile.people && !s.profile?.adults) profile.adults = profile.people;
  delete profile.people;
  const picked = (s.picked || []).map(p => (typeof p === 'string' ? { id: p, qty: 1 } : p));
  const listTweaks = { ...d.listTweaks, ...s.listTweaks };
  return { ...d, ...s, profile, picked, listTweaks };
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
