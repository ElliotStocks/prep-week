// Nutrition values are per 100g, approximated from UK CoFID composition data.
// Dinner recipes now live in src/dishes.js (the v2 real-dish library) — this file
// keeps breakfasts, quiz options and daily reference intakes.

export const BREAKFASTS = [
  { id: 'overnight-oats', name: 'Overnight oats, berries & seeds', allergens: ['dairy', 'gluten'], dietLevel: 2, perServing: { kcal: 380, prot: 14, carb: 55, fat: 11, fibre: 8, iron: 2.5, calcium: 250, vitc: 15, potassium: 420 }, items: [['rolled oats', 50, 'pantry'], ['milk', 150, 'fresh'], ['frozen berries', 80, 'fresh'], ['chia seeds', 10, 'pantry'], ['honey', 10, 'pantry']] },
  { id: 'yoghurt-bowl', name: 'Greek yoghurt, honey & walnuts', allergens: ['dairy', 'nuts'], dietLevel: 2, perServing: { kcal: 320, prot: 20, carb: 28, fat: 14, fibre: 3, iron: 0.8, calcium: 220, vitc: 8, potassium: 380 }, items: [['Greek yoghurt', 170, 'fresh'], ['honey', 15, 'pantry'], ['walnuts', 20, 'pantry'], ['blueberries', 80, 'fresh']] },
  { id: 'eggs-toast', name: 'Scrambled eggs on wholegrain toast', allergens: ['eggs', 'dairy', 'gluten'], dietLevel: 2, perServing: { kcal: 410, prot: 26, carb: 35, fat: 18, fibre: 5, iron: 3, calcium: 120, vitc: 0, potassium: 330 }, items: [['free-range eggs', 120, 'fresh'], ['wholegrain bread', 80, 'fresh'], ['butter', 10, 'fresh']] },
  { id: 'smoothie', name: 'Banana, oat & peanut smoothie', allergens: ['peanuts', 'dairy', 'gluten'], dietLevel: 2, perServing: { kcal: 450, prot: 19, carb: 55, fat: 17, fibre: 7, iron: 2, calcium: 280, vitc: 12, potassium: 800 }, items: [['bananas', 120, 'fresh'], ['rolled oats', 40, 'pantry'], ['peanut butter', 25, 'pantry'], ['milk', 200, 'fresh']] },
  { id: 'omelette', name: 'Pepper & spinach omelette', allergens: ['eggs'], dietLevel: 2, perServing: { kcal: 360, prot: 22, carb: 4, fat: 28, fibre: 2, iron: 3.2, calcium: 130, vitc: 60, potassium: 420 }, items: [['free-range eggs', 180, 'fresh'], ['peppers', 50, 'fresh'], ['spinach', 30, 'fresh'], ['olive oil', 5, 'pantry']] },
  { id: 'porridge', name: 'Fruit & almond porridge', allergens: ['dairy', 'gluten', 'nuts'], dietLevel: 2, perServing: { kcal: 420, prot: 15, carb: 60, fat: 13, fibre: 7, iron: 2.4, calcium: 300, vitc: 8, potassium: 650 }, items: [['rolled oats', 60, 'pantry'], ['milk', 250, 'fresh'], ['bananas', 100, 'fresh'], ['flaked almonds', 15, 'pantry']] },
  { id: 'tofu-scramble', name: 'Turmeric tofu scramble', allergens: ['soy'], dietLevel: 3, perServing: { kcal: 300, prot: 21, carb: 6, fat: 20, fibre: 3, iron: 4.5, calcium: 320, vitc: 45, potassium: 450 }, items: [['firm tofu', 150, 'fresh'], ['spinach', 40, 'fresh'], ['peppers', 50, 'fresh'], ['ground turmeric', 2, 'pantry'], ['olive oil', 8, 'pantry']] },
  { id: 'chia-pudding', name: 'Chia pudding with berries', allergens: ['gluten'], dietLevel: 3, perServing: { kcal: 310, prot: 10, carb: 32, fat: 15, fibre: 12, iron: 3, calcium: 350, vitc: 20, potassium: 300 }, items: [['chia seeds', 30, 'pantry'], ['oat milk', 200, 'fresh'], ['frozen berries', 90, 'fresh'], ['honey', 10, 'pantry']] },
];

// Daily reference intakes used for the % figures on the nutrition panel (UK NHS values)
export const DAILY_REF = { fibre: 30, iron: 14, calcium: 700, vitc: 80, potassium: 3500 };

export const ALLERGY_OPTIONS = [
  ['peanuts', 'Peanuts'], ['nuts', 'Tree nuts'], ['fish', 'Fish'], ['shellfish', 'Shellfish'],
  ['eggs', 'Eggs'], ['dairy', 'Dairy'], ['gluten', 'Gluten / wheat'], ['soy', 'Soy'],
];

export const DIET_OPTIONS = [
  ['none', 'No restrictions'], ['veggie', 'Vegetarian'], ['vegan', 'Vegan'], ['pesc', 'Pescatarian'],
  ['gf', 'Gluten free'], ['keto', 'Keto / low carb'],
];

export const SUPERMARKETS = [['ocado', 'Ocado (M&S range)']];
export const SUPERMARKETS_SOON = ['Tesco', 'Sainsbury’s'];

export const APPETITE_LEVELS = [['Lighter', 0.85], ['Standard', 1], ['Hearty', 1.2]];

export const LIKE_OPTIONS = [
  ['chicken', 'Chicken'], ['beef', 'Beef'], ['turkey', 'Turkey'], ['lamb', 'Lamb'], ['pork', 'Pork'],
  ['fish', 'Fish'], ['shellfish', 'Prawns & shellfish'], ['eggs', 'Eggs'], ['legumes', 'Beans & lentils'], ['tofu', 'Tofu'],
];
