const KEY = 'mealprep-state-v1';

export const newPerson = () => ({ age: 32, gender: 'na', weight: 75, height: 175, activity: 1, goal: 'maintain' });

export const defaultState = () => ({
  onboarded: false,
  profile: {
    people: 2,
    persons: [newPerson(), newPerson()],
    allergies: [],
    diet: ['none'],
    likes: [],
    dislikes: '',
    ndin: 5,
  },
  picked: [],       // recipe ids for this week
  customPicks: [],  // free-text ideas turned into recipes: {id, label}
  breakfasts: [],   // breakfast ids
  pantryOwned: [],  // pantry items the kitchen already has
});

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = { ...defaultState(), ...JSON.parse(raw) };
    s.profile = { ...defaultState().profile, ...s.profile };
    return s;
  } catch {
    return defaultState();
  }
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
