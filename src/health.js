// Week Health: plant-diversity counting and ultra-processed-food flagging for the
// shopping list. Deliberately conservative — whole plant foods count once per
// distinct plant (all tomato products = one tomato), UPF flags only clear-cut
// NOVA-4 style items, and non-food lines stay out of the maths entirely.

// ingredient name → plant label (distinct labels = the week's plant count)
export const PLANT_OF = {
  broccoli: 'broccoli', 'tenderstem broccoli': 'tenderstem broccoli', peppers: 'pepper',
  spinach: 'spinach', 'green beans': 'green bean', courgettes: 'courgette',
  'rainbow slaw mix': 'slaw veg', garlic: 'garlic', onions: 'onion', 'red onions': 'red onion',
  mushrooms: 'mushroom', cauliflower: 'cauliflower', carrots: 'carrot', celery: 'celery',
  'cherry tomatoes': 'cherry tomato', cucumber: 'cucumber', 'little gem lettuce': 'lettuce',
  'spring onions': 'spring onion', leeks: 'leek', aubergine: 'aubergine', kale: 'kale',
  'sweet potatoes': 'sweet potato', 'baby potatoes': 'potato', potatoes: 'potato',
  lemons: 'lemon', limes: 'lime', avocados: 'avocado', bananas: 'banana',
  blueberries: 'blueberry', apples: 'apple', oranges: 'orange', grapes: 'grape',
  'frozen berries': 'mixed berries', 'dried apricots': 'apricot', olives: 'olive',
  chickpeas: 'chickpea', lentils: 'green lentil', 'red lentils': 'red lentil',
  'black beans': 'black bean', 'kidney beans': 'kidney bean', 'cannellini beans': 'cannellini bean',
  'frozen peas': 'pea', sweetcorn: 'sweetcorn',
  'brown rice': 'rice', 'basmati rice': 'rice', 'arborio rice': 'rice',
  quinoa: 'quinoa', couscous: 'wheat', 'bulgur wheat': 'wheat', 'wholewheat pasta': 'wheat',
  orzo: 'wheat', 'wholegrain bread': 'wheat', 'rolled oats': 'oats', 'oat milk': 'oats',
  'rice noodles': 'rice', 'chopped tomatoes': 'tomato', passata: 'tomato', 'tomato puree': 'tomato',
  'firm tofu': 'soy', 'peanut butter': 'peanut', walnuts: 'walnut', 'flaked almonds': 'almond',
  'mixed nuts': 'mixed nuts', 'chia seeds': 'chia', capers: 'caper', houmous: 'chickpea',
  'fresh ginger': 'ginger', 'fresh coriander': 'coriander', 'flat-leaf parsley': 'parsley',
  'fresh basil': 'basil', 'coconut milk': 'coconut',
};

// clear-cut ultra-processed items (NOVA-4 style)
export const UPF_ITEMS = new Set([
  'crisps', 'tortilla chips', 'milk chocolate', 'dark chocolate', 'biscuits', 'ice cream',
  'cereal bars', 'cereal', 'popcorn', 'salsa', 'rice cakes',
  'pork sausages', 'chorizo', 'tortilla wraps',
]);

// household items — excluded from food maths entirely
export const NON_FOOD = new Set([
  'toilet roll', 'kitchen roll', 'tissues', 'washing up liquid', 'dishwasher tablets',
  'laundry pods', 'surface cleaner', 'bin bags', 'tin foil', 'toothpaste', 'shampoo',
  'shower gel', 'hand soap',
]);

// lines: [{name, cost}] where cost is what that line contributes to the basket.
// Returns { plants, upfPct } — distinct plants and UPF share of food spend.
export function weekHealth(lines) {
  const plants = new Set();
  let foodCost = 0;
  let upfCost = 0;
  for (const { name, cost } of lines) {
    if (NON_FOOD.has(name)) continue;
    foodCost += cost;
    if (UPF_ITEMS.has(name)) upfCost += cost;
    const plant = PLANT_OF[name];
    if (plant && !UPF_ITEMS.has(name)) plants.add(plant);
  }
  return {
    plants: plants.size,
    upfPct: foodCost > 0 ? Math.round((upfCost / foodCost) * 100) : 0,
  };
}
