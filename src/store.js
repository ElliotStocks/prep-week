const KEY = 'stocked-state-v1';

// Saves written before the app was renamed from Prep Week to Stocked. Read once, so
// nobody loses the week they had already planned. Left in place rather than deleted:
// harmless, and it means an older build still finds its data.
const LEGACY_KEYS = ['mealprep-state-v1'];

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
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], // nights being cooked
    budget: 'none',     // weekly shop budget band (BUDGET_OPTIONS key)
    quickEasy: false,   // bias suggestions toward fast, low-effort dishes
    equipment: ['oven', 'hob', 'microwave', 'grill', 'blender'], // kitchen kit
    appetite: 1,        // 0 light, 1 standard, 2 hearty
    proteinBoost: false,
    organicPref: false, // prefer organic products where the supermarket has them
  },
  picked: [],       // dinners for the week: {id, qty} — qty = nights cooked-for
  customPicks: [],  // free-text ideas turned into recipes: {id, label}
  breakfasts: [],   // breakfast ids
  pantryOwned: [],  // pantry items the kitchen already has
  favourites: [],   // dish ids the user hearts — float to the top of the browser
  ratings: {},      // dishId -> {score: 1|-1, ratedAt} from the weekly "how was it?"
  ratingPromptedAt: null, // when we last showed (or armed) the weekly rating card
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
  // profiles from before the equipment question get the standard kitchen
  if (!Array.isArray(profile.equipment)) profile.equipment = d.profile.equipment;
  // profiles from before the budget question shop without a limit
  if (!profile.budget) profile.budget = 'none';
  // profiles from before the days question cook every night
  if (!Array.isArray(profile.days) || !profile.days.length) profile.days = d.profile.days;
  // people count (flat) → age-banded household
  if (profile.people && !s.profile?.adults) profile.adults = profile.people;
  delete profile.people;
  const picked = (s.picked || []).map(p => (typeof p === 'string' ? { id: p, qty: 1 } : p));
  const listTweaks = { ...d.listTweaks, ...s.listTweaks };
  return { ...d, ...s, profile, picked, listTweaks };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
      ?? LEGACY_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if (!raw) return defaultState();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
