// Ocado (M&S range) shopping dictionary. Every ingredient name the stock list can
// produce maps to a curated search phrase plus rules for picking the right product
// from the results:
//   search    — what to type into Ocado search
//   must      — lowercase tokens that must ALL appear in the product title
//               (a token may offer alternatives separated by |)
//   not       — tokens that disqualify a title (e.g. keep 'peanut' out of 'butter')
//   unitGrams — for items sold by count (eggs): grams per unit
//   netFactor — for tinned goods: usable fraction of the pack weight once drained
// The app never places an order — matches become links and prices only.

export const OCADO_ITEMS = {
  // proteins
  'chicken thighs':     { search: 'M&S chicken thigh fillets', must: ['chicken', 'thigh'], not: ['indian', 'grill', 'marinated', 'sticky', 'bbq', 'piri', 'roast in the bag'] },
  'chicken breast':     { search: 'M&S chicken breast fillets', must: ['chicken', 'breast'] },
  'lean beef mince':    { search: 'M&S lean beef mince', must: ['beef', 'mince', 'lean|5%'] },
  'beef steak strips':  { search: 'M&S beef stir fry strips', must: ['beef', 'strip'] },
  'turkey mince':       { search: 'turkey mince', must: ['turkey', 'mince'] },
  'salmon fillets':     { search: 'M&S salmon fillets', must: ['salmon', 'fillet'], not: ['smoked'] },
  'cod fillets':        { search: 'M&S cod fillets', must: ['cod', 'fillet'], not: ['battered', 'breaded', 'made without', 'in sauce', 'fish cake', 'goujon', 'dusted', 'crumb'] },
  'king prawns':        { search: 'M&S king prawns raw', must: ['prawn'], not: ['cocktail', 'battered', 'marinated', 'paprika', 'garlic', 'chilli', 'tempura', 'crispy', 'katsu', 'filo', 'taste of asia', 'sandwich'] },
  'free-range eggs':    { search: 'M&S free range eggs', must: ['egg'], not: ['chocolate'], unitGrams: 60 },
  'chickpeas':          { search: 'chickpeas in water tin', must: ['chickpea'], netFactor: 0.6 },
  // dried lentils roughly 2.5x their weight once cooked
  'lentils':            { search: 'dried green lentils', must: ['lentil'], not: ['soup', 'crisps', 'dahl', 'dal', 'salad', 'snack', 'curl', 'in water'], netFactor: 2.5 },
  'black beans':        { search: 'black beans in water tin', must: ['black', 'bean'], netFactor: 0.6 },
  'firm tofu':          { search: 'firm tofu', must: ['tofu'] },
  // carbs
  'brown rice':         { search: 'brown rice', must: ['brown|wholegrain', 'rice'], not: ['microwave', 'pouch', 'pudding', 'cracker', 'noodle', 'sushi', 'egg', 'cake'] },
  'quinoa':             { search: 'M&S quinoa', must: ['quinoa'] },
  'sweet potatoes':     { search: 'M&S sweet potatoes', must: ['sweet', 'potato'], not: ['fries', 'mash'] },
  'baby potatoes':      { search: 'M&S baby potatoes', must: ['potato'], not: ['sweet'] },
  'couscous':           { search: 'couscous plain', must: ['couscous'], not: ['moroccan', 'fruity', 'roasted', 'flavour', 'giant', 'salad'] },
  'wholewheat pasta':   { search: 'wholewheat pasta', must: ['wholewheat|whole wheat|wholemeal', 'pasta|fusilli|penne|spaghetti'] },
  // veg
  'broccoli':           { search: 'M&S broccoli', must: ['broccoli'], not: ['tenderstem'] },
  'peppers':            { search: 'M&S mixed peppers', must: ['pepper'], not: ['black pepper', 'stuffed'], unitGrams: 160 },
  'spinach':            { search: 'M&S baby spinach', must: ['spinach'] },
  'green beans':        { search: 'M&S green beans', must: ['green', 'bean'] },
  'courgettes':         { search: 'M&S courgettes', must: ['courgette'], not: ['baby', 'spiral', 'ribbon'] },
  'rainbow slaw mix':   { search: 'rainbow slaw mix', must: ['slaw', 'rainbow|crunch|vegetable'], not: ['pickled', 'creamy', 'dressed', 'potato', 'coleslaw', 'remoulade', 'mayo'] },
  'tenderstem broccoli': { search: 'M&S tenderstem broccoli', must: ['tenderstem'], not: ['bean', 'corn', 'medley'] },
  // flavour fresh
  'garlic':             { search: 'garlic bulb', must: ['garlic'], not: ['bread', 'paste', 'puree'] },
  'lemons':             { search: 'M&S lemons', must: ['lemon'], not: ['juice', 'curd'] },
  'fresh ginger':       { search: 'fresh root ginger', must: ['ginger'], not: ['beer', 'ale', 'biscuit'] },
  // spices & staples
  'mixed dried herbs':  { search: 'dried mixed herbs', must: ['mixed herbs|herbes'] },
  'olive oil':          { search: 'olive oil 500ml', must: ['olive', 'oil'] },
  'smoked paprika':     { search: 'smoked paprika', must: ['paprika'] },
  'black pepper':       { search: 'black peppercorns grinder', must: ['black', 'pepper'] },
  'harissa paste':      { search: 'harissa paste', must: ['harissa'] },
  'ground cumin':       { search: 'ground cumin', must: ['cumin'] },
  'ground coriander':   { search: 'ground coriander', must: ['coriander'] },
  'ground turmeric':    { search: 'ground turmeric', must: ['cook with|ground', 'turmeric'], not: ['fresh', 'root', 'shot', 'latte'] },
  // breakfast
  'rolled oats':        { search: 'porridge oats 1kg', must: ['porridge|rolled|scottish', 'oats'], not: ['pot', 'sachet', 'golden syrup', 'chocolate', 'protein', 'instant'] },
  'milk':               { search: 'semi skimmed milk 4 pints', must: ['milk'], not: ['oat', 'almond', 'coconut', 'chocolate'] },
  'oat milk':           { search: 'oat milk drink', must: ['oat'], not: ['chocolate', 'vanilla', 'strawberry', 'coffee'] },
  'frozen berries':     { search: 'frozen berry mix', must: ['berr'], not: ['fresh'] },
  'chia seeds':         { search: 'chia seeds', must: ['chia'] },
  'honey':              { search: 'squeezy honey', must: ['honey'], not: ['roast', 'yogurt', 'granola'] },
  'Greek yoghurt':      { search: 'greek style yogurt', must: ['greek', 'yogurt|yoghurt'], not: ['honey', 'fruit', 'vanilla', 'coconut', 'cherry', 'strawberry', 'mango', 'lemon'] },
  'walnuts':            { search: 'walnut pieces', must: ['walnut'] },
  'blueberries':        { search: 'M&S blueberries', must: ['blueberr'], not: ['muffin', 'frozen', 'pancake', 'yogurt', 'jam', 'conserve'] },
  'wholegrain bread':   { search: 'wholemeal bread loaf', must: ['wholemeal|wholegrain|whole grain|seeded', 'bread|loaf'] },
  'butter':             { search: 'M&S butter', must: ['butter'], not: ['peanut', 'almond', 'cashew', 'biscuit'] },
  'bananas':            { search: 'bananas', must: ['banana'], not: ['bread', 'milkshake'], unitGrams: 120 },
  'peanut butter':      { search: 'peanut butter smooth', must: ['peanut', 'butter'] },
  'flaked almonds':     { search: 'flaked almonds', must: ['flaked', 'almond'] },
  // v2 dish library additions
  'lamb mince':         { search: 'M&S lamb mince', must: ['lamb', 'mince'] },
  'pork sausages':      { search: 'M&S British pork sausages', must: ['pork', 'sausage'], not: ['chipolata', 'cocktail', 'vegan', 'veggie', 'roll'] },
  'tinned tuna':        { search: 'tuna chunks in spring water', must: ['tuna'], not: ['steak', 'pasta', 'sandwich', 'mayo', 'salad'] },
  'halloumi':           { search: 'halloumi cheese', must: ['halloumi'], not: ['kebab', 'burger', 'fries', 'bites', 'light', 'chilli'] },
  'feta':               { search: 'greek feta cheese', must: ['feta'], not: ['salad', 'stuffed', 'light', 'pastry'] },
  'cheddar':            { search: 'M&S mature cheddar', must: ['cheddar'], not: ['slices', 'spread', 'light', 'crisps', 'sticks'] },
  'parmesan':           { search: 'parmigiano reggiano', must: ['parmigiano|parmesan'], not: ['crisps'] },
  'kidney beans':       { search: 'red kidney beans in water', must: ['kidney', 'bean'], not: ['chilli'], netFactor: 0.6 },
  'cannellini beans':   { search: 'cannellini beans', must: ['cannellini'], netFactor: 0.6 },
  'red lentils':        { search: 'dried red split lentils', must: ['red', 'lentil'], not: ['soup', 'snack', 'crisps'] },
  'chopped tomatoes':   { search: 'chopped tomatoes tin', must: ['chopped', 'tomato'], not: ['basil', 'garlic', 'onion', 'chilli', 'herb'] },
  'passata':            { search: 'passata', must: ['passata'], not: ['basil', 'garlic'] },
  'coconut milk':       { search: 'coconut milk tin', must: ['coconut', 'milk'], not: ['drink', 'yoghurt', 'yogurt', 'chocolate'] },
  'sweetcorn':          { search: 'sweetcorn', must: ['sweetcorn|sweet corn'], not: ['baby', 'cob', 'crisp', 'fritter', 'rice', 'tuna'], netFactor: 0.8 },
  'frozen peas':        { search: 'frozen garden peas', must: ['peas'], not: ['mushy', 'marrowfat', 'snap', 'sugar', 'protein'] },
  'basmati rice':       { search: 'basmati rice 1kg', must: ['basmati'], not: ['microwave', 'pouch', 'brown', 'pilau', 'wholegrain'] },
  'arborio rice':       { search: 'arborio risotto rice', must: ['arborio|risotto'], not: ['pouch', 'mushroom', 'tomato'] },
  'egg noodles':        { search: 'medium egg noodles', must: ['noodle'], not: ['rice', 'instant', 'pot', 'singapore', 'wok'] },
  'bulgur wheat':       { search: 'bulgur wheat', must: ['bulgur|bulgar'], not: ['salad', 'tabbouleh'] },
  'tortilla wraps':     { search: 'plain tortilla wraps', must: ['wrap|tortilla'], not: ['crisps', 'chips', 'stuffed', 'filled', 'mini'] },
  'onions':             { search: 'brown onions', must: ['onion'], not: ['red', 'pickled', 'spring', 'rings', 'chutney', 'powder'], unitGrams: 160 },
  'red onions':         { search: 'red onions', must: ['red', 'onion'], not: ['pickled', 'chutney', 'marmalade'], unitGrams: 150 },
  'mushrooms':          { search: 'chestnut mushrooms', must: ['mushroom'], not: ['stuffed', 'garlic', 'breaded', 'soup', 'pate', 'dried'] },
  'cauliflower':        { search: 'cauliflower florets', must: ['cauliflower', 'floret'], not: ['rice', 'riced', 'cheese', 'bites', 'steak', 'wings', 'sweetstem', 'romanesco', 'broccoli'] },
  'carrots':            { search: 'carrots', must: ['carrot'], not: ['baton', 'cake', 'juice', 'crisps', 'chantenay'] },
  'celery':             { search: 'celery', must: ['celery'], not: ['salt', 'soup'] },
  'cherry tomatoes':    { search: 'cherry tomatoes', must: ['tomato'], not: ['chopped', 'sun', 'juice', 'soup', 'tin', 'passata'] },
  'cucumber':           { search: 'cucumber', must: ['cucumber'], not: ['pickled', 'relish', 'baby', 'mini'] },
  'little gem lettuce': { search: 'little gem lettuce', must: ['little gem'], unitGrams: 90 },
  'spring onions':      { search: 'spring onions', must: ['spring onion'], not: ['rice', 'soup', 'mash', 'pickled'] },
  'avocados':           { search: 'perfectly ripe avocados', must: ['avocado'], not: ['oil', 'smash'], unitGrams: 140 },
  'limes':              { search: 'M&S limes', must: ['lime'], not: ['juice', 'cordial', 'leaves', 'lemon', 'pickle'], unitGrams: 70 },
  'fresh coriander':    { search: 'fresh coriander', must: ['coriander'], not: ['ground', 'seed'] },
  'flat-leaf parsley':  { search: 'flat leaf parsley', must: ['parsley'], not: ['dried', 'sauce'] },
  'fresh basil':        { search: 'fresh basil', must: ['basil'], not: ['dried', 'pesto', 'tomato'] },
  'olives':             { search: 'pitted green olives', must: ['olive'], not: ['oil', 'tapenade', 'bread', 'stuffed', 'lemon', 'chilli'] },
  'dried apricots':     { search: 'soft dried apricots', must: ['dried|soft', 'apricot'], not: ['yogurt', 'fresh', 'conserve', 'jam', 'mixed', 'cranberry'] },
  'capers':             { search: 'capers in brine', must: ['caper'], not: [] },
  'soy sauce':          { search: 'dark soy sauce', must: ['soy sauce'], not: ['sweet'] },
  'sesame oil':         { search: 'toasted sesame oil', must: ['sesame', 'oil'] },
  'tomato puree':       { search: 'tomato puree', must: ['puree|purée'], not: ['garlic', 'sun'] },
  'thai green curry paste': { search: 'thai green curry paste', must: ['green', 'curry', 'paste'] },
  'tikka curry paste':  { search: 'tikka masala curry paste', must: ['tikka', 'paste'] },
  'garam masala':       { search: 'garam masala', must: ['garam'] },
  'chilli flakes':      { search: 'crushed chilli flakes', must: ['chilli', 'flakes|crushed'], not: ['oil', 'sauce', 'jam'] },
  'dried oregano':      { search: 'dried oregano', must: ['oregano'] },
  'ground cinnamon':    { search: 'ground cinnamon', must: ['cinnamon'], not: ['stick', 'bun', 'swirl', 'sugar'] },
  'vegetable stock cubes': { search: 'vegetable stock cubes', must: ['vegetable', 'stock'], not: ['gravy', 'fresh'] },
};

export const searchUrl = name =>
  `https://www.ocado.com/search?entry=${encodeURIComponent(OCADO_ITEMS[name]?.search || `M&S ${name}`)}`;

// "600g" | "1kg" | "2 x 210g" | "500ml" | "1L" | "4 pints" | "6 per pack" → usable grams
// (ml treated as grams — close enough for planning). Returns null if unreadable.
export function packGrams(name, sizeText) {
  if (!sizeText) return null;
  const item = OCADO_ITEMS[name] || {};
  const s = sizeText.toLowerCase().replace(/,/g, '');
  const perPack = s.match(/(\d+)\s*per pack/);
  if (perPack && item.unitGrams) return Number(perPack[1]) * item.unitGrams;
  const m = s.match(/(?:(\d+)\s*x\s*)?(\d+(?:\.\d+)?)\s*(kg|g|ml|l|litre|pint)/);
  if (!m) return null;
  const mult = m[1] ? Number(m[1]) : 1;
  const n = Number(m[2]);
  const unit = { kg: 1000, g: 1, ml: 1, l: 1000, litre: 1000, pint: 568 }[m[3]];
  const gross = mult * n * unit;
  return Math.round(gross * (item.netFactor || 1));
}

// How many packs of `product` cover `grams` of the ingredient. 1 pack minimum.
export function packsFor(grams, product) {
  if (!grams || !product?.packGrams) return 1;
  return Math.max(1, Math.ceil(grams / product.packGrams));
}
