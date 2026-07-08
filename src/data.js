// Nutrition values are per 100g (raw / dry as sold), approximated from UK CoFID
// composition data. Good enough for weekly planning; not medical advice.
// micros: iron mg, calcium mg, vitC mg, potassium mg, fibre g

export const PROTEINS = [
  { id: 'chicken-thighs', name: 'chicken thighs', tag: 'chicken', allergen: null, dietLevel: 0, grams: 150, icon: 'meat', n: { kcal: 145, prot: 19, carb: 0, fat: 8, fibre: 0, iron: 0.9, calcium: 9, vitc: 0, potassium: 240 } },
  { id: 'chicken-breast', name: 'chicken breast', tag: 'chicken', allergen: null, dietLevel: 0, grams: 150, icon: 'meat', n: { kcal: 106, prot: 22, carb: 0, fat: 2, fibre: 0, iron: 0.5, calcium: 6, vitc: 0, potassium: 330 } },
  { id: 'beef-mince', name: 'lean beef mince', tag: 'beef', allergen: null, dietLevel: 0, grams: 150, icon: 'meat', n: { kcal: 130, prot: 21, carb: 0, fat: 5, fibre: 0, iron: 2.2, calcium: 12, vitc: 0, potassium: 330 } },
  { id: 'beef-strips', name: 'beef steak strips', tag: 'beef', allergen: null, dietLevel: 0, grams: 150, icon: 'meat', n: { kcal: 135, prot: 22, carb: 0, fat: 5, fibre: 0, iron: 2.5, calcium: 10, vitc: 0, potassium: 350 } },
  { id: 'turkey-mince', name: 'turkey mince', tag: 'turkey', allergen: null, dietLevel: 0, grams: 150, icon: 'meat', n: { kcal: 120, prot: 22, carb: 0, fat: 4, fibre: 0, iron: 1.4, calcium: 12, vitc: 0, potassium: 300 } },
  { id: 'salmon', name: 'salmon fillets', tag: 'fish', allergen: 'fish', dietLevel: 1, grams: 140, icon: 'fish', n: { kcal: 200, prot: 20, carb: 0, fat: 13, fibre: 0, iron: 0.4, calcium: 12, vitc: 2, potassium: 380 } },
  { id: 'cod', name: 'cod fillets', tag: 'fish', allergen: 'fish', dietLevel: 1, grams: 160, icon: 'fish', n: { kcal: 80, prot: 18, carb: 0, fat: 0.7, fibre: 0, iron: 0.3, calcium: 15, vitc: 1, potassium: 400 } },
  { id: 'prawns', name: 'king prawns', tag: 'shellfish', allergen: 'shellfish', dietLevel: 1, grams: 140, icon: 'fish', n: { kcal: 70, prot: 16, carb: 0, fat: 0.6, fibre: 0, iron: 1.1, calcium: 60, vitc: 0, potassium: 180 } },
  { id: 'eggs', name: 'free-range eggs', tag: 'eggs', allergen: 'eggs', dietLevel: 2, grams: 120, unit: { per: 60, name: 'egg' }, icon: 'egg', n: { kcal: 143, prot: 13, carb: 1, fat: 10, fibre: 0, iron: 1.8, calcium: 55, vitc: 0, potassium: 130 } },
  { id: 'chickpeas', name: 'chickpeas', tag: 'legumes', allergen: null, dietLevel: 3, grams: 200, icon: 'plant', n: { kcal: 120, prot: 7, carb: 17, fat: 2.5, fibre: 6, iron: 1.5, calcium: 45, vitc: 1, potassium: 240 } },
  { id: 'lentils', name: 'lentils', tag: 'legumes', allergen: null, dietLevel: 3, grams: 200, icon: 'plant', n: { kcal: 115, prot: 9, carb: 17, fat: 0.5, fibre: 5, iron: 3.3, calcium: 25, vitc: 1, potassium: 310 } },
  { id: 'black-beans', name: 'black beans', tag: 'legumes', allergen: null, dietLevel: 3, grams: 200, icon: 'plant', n: { kcal: 120, prot: 8, carb: 20, fat: 0.5, fibre: 7, iron: 1.8, calcium: 30, vitc: 0, potassium: 300 } },
  { id: 'tofu', name: 'firm tofu', tag: 'tofu', allergen: 'soy', dietLevel: 3, grams: 150, icon: 'plant', n: { kcal: 115, prot: 12, carb: 2, fat: 7, fibre: 1, iron: 2.7, calcium: 200, vitc: 0, potassium: 150 } },
];

export const CARBS = [
  { id: 'brown-rice', name: 'brown rice', allergen: null, grams: 65, dry: true, n: { kcal: 350, prot: 7.5, carb: 74, fat: 2.7, fibre: 3.5, iron: 1.3, calcium: 20, vitc: 0, potassium: 250 } },
  { id: 'quinoa', name: 'quinoa', allergen: null, grams: 65, dry: true, n: { kcal: 368, prot: 14, carb: 64, fat: 6, fibre: 7, iron: 4.6, calcium: 47, vitc: 0, potassium: 560 } },
  { id: 'sweet-potato', name: 'sweet potatoes', allergen: null, grams: 250, n: { kcal: 86, prot: 1.6, carb: 20, fat: 0.1, fibre: 3, iron: 0.6, calcium: 30, vitc: 2.4, potassium: 340 } },
  { id: 'baby-potatoes', name: 'baby potatoes', allergen: null, grams: 250, n: { kcal: 77, prot: 2, carb: 17, fat: 0.1, fibre: 2, iron: 0.8, calcium: 12, vitc: 12, potassium: 420 } },
  { id: 'couscous', name: 'couscous', allergen: 'gluten', grams: 65, dry: true, n: { kcal: 376, prot: 13, carb: 77, fat: 0.6, fibre: 5, iron: 1.1, calcium: 24, vitc: 0, potassium: 170 } },
  { id: 'ww-pasta', name: 'wholewheat pasta', allergen: 'gluten', grams: 75, dry: true, n: { kcal: 350, prot: 13, carb: 66, fat: 2.5, fibre: 9, iron: 3.6, calcium: 30, vitc: 0, potassium: 250 } },
];

export const VEG = [
  { id: 'broccoli', name: 'broccoli', grams: 150, n: { kcal: 34, prot: 2.8, carb: 7, fat: 0.4, fibre: 2.6, iron: 0.7, calcium: 47, vitc: 89, potassium: 320 } },
  { id: 'peppers', name: 'peppers', grams: 150, n: { kcal: 26, prot: 1, carb: 6, fat: 0.3, fibre: 2, iron: 0.4, calcium: 7, vitc: 128, potassium: 210 } },
  { id: 'spinach', name: 'spinach', grams: 120, n: { kcal: 23, prot: 2.9, carb: 3.6, fat: 0.4, fibre: 2.2, iron: 2.7, calcium: 99, vitc: 28, potassium: 560 } },
  { id: 'green-beans', name: 'green beans', grams: 150, n: { kcal: 31, prot: 1.8, carb: 7, fat: 0.2, fibre: 2.7, iron: 1, calcium: 37, vitc: 12, potassium: 210 } },
  { id: 'courgettes', name: 'courgettes', grams: 150, n: { kcal: 17, prot: 1.2, carb: 3.1, fat: 0.3, fibre: 1, iron: 0.4, calcium: 16, vitc: 18, potassium: 260 } },
  { id: 'slaw', name: 'rainbow slaw mix', grams: 130, n: { kcal: 30, prot: 1.3, carb: 6, fat: 0.2, fibre: 2.6, iron: 0.4, calcium: 45, vitc: 35, potassium: 230 } },
  { id: 'tenderstem', name: 'tenderstem broccoli', grams: 150, n: { kcal: 35, prot: 3, carb: 4, fat: 0.5, fibre: 3, iron: 1, calcium: 60, vitc: 80, potassium: 300 } },
];

// Each flavour lists the store-cupboard items it needs. `fresh` items go on the
// weekly list every time; `pantry` items are bought once and remembered.
export const FLAVOURS = [
  { id: 'garlic-herb', name: 'Garlic & herb', fresh: ['garlic'], pantry: ['mixed dried herbs', 'olive oil'] },
  { id: 'smoked-paprika', name: 'Smoked paprika', fresh: ['garlic'], pantry: ['smoked paprika', 'olive oil'] },
  { id: 'lemon-pepper', name: 'Lemon & pepper', fresh: ['lemons'], pantry: ['black pepper', 'olive oil'] },
  { id: 'harissa', name: 'Harissa', fresh: [], pantry: ['harissa paste', 'olive oil'] },
  { id: 'cumin', name: 'Cumin-spiced', fresh: [], pantry: ['ground cumin', 'ground coriander', 'olive oil'] },
  { id: 'ginger', name: 'Ginger & garlic', fresh: ['fresh ginger', 'garlic'], pantry: ['olive oil'] },
];

export const METHODS = [
  { id: 'one-pan', name: 'One-pan', mins: 35 },
  { id: 'traybake', name: 'Traybaked', mins: 45 },
  { id: 'grill', name: 'Grilled', mins: 25 },
  { id: 'pan-sear', name: 'Pan-seared', mins: 25 },
  { id: 'bake', name: 'Baked', mins: 40 },
  { id: 'slow-cook', name: 'Slow-cooked', mins: 70 },
];

export const OIL_N = { kcal: 884, prot: 0, carb: 0, fat: 100, fibre: 0, iron: 0, calcium: 0, vitc: 0, potassium: 0 };

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
  ['none', 'No restrictions'], ['veggie', 'Vegetarian'], ['vegan', 'Vegan'], ['pesc', 'Pescatarian'], ['gf', 'Gluten free'],
];

export const LIKE_OPTIONS = [
  ['chicken', 'Chicken'], ['beef', 'Beef'], ['turkey', 'Turkey'], ['fish', 'Fish'],
  ['shellfish', 'Prawns & shellfish'], ['eggs', 'Eggs'], ['legumes', 'Beans & lentils'], ['tofu', 'Tofu'],
];

export const ACTIVITY_LEVELS = [
  ['Mostly sitting', 1.3], ['Lightly active', 1.45], ['Active', 1.6], ['Very active', 1.75],
];
