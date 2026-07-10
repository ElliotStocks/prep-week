# Prep Week

A weekly meal planner anyone can use. A short food-only quiz (supermarket, people,
allergies, dietary requirements including keto, likes, dislikes, appetite) leads
straight to a recipe browser of real, named dishes — curries, traybakes, chillis,
stir-fries, pies, bowls — each with a photo, a price per portion from real supermarket prices, batch-cooking
method steps and nutrition computed from per-100g composition data. Meals are picked
with a nights counter ("cook once, eat 2 nights"). Picked meals build a full weekly kitchen stock
list: fresh food, breakfasts, spices and cupboard staples, with a pantry memory so
staples aren't re-bought.

## Run it

```
npm install
npm run dev
```

Then open http://localhost:5173

All data stays in the browser (localStorage). No accounts, no server.

## Ocado product matching

Every stock-list line is matched to a real M&S product on Ocado — name, pack size,
price, and how many packs the week needs — with an estimated basket total. Lines
without a good match fall back to a pre-filled Ocado search link. The app never
places an order; every link just opens Ocado in a new tab.

Prices are a snapshot, refreshed with `npm run ocado` (queries Ocado's own product
search API, one polite request per ingredient, ~1 minute).

## Roadmap

- v2: Ocado basket assistant — browser automation that adds the matched products to
  the basket for review (matching + prices shipped July 2026).
- v2: AI-generated recipes for the "type anything" box (currently matched to the closest
  dish in the library).
- v3: per-person meal variants, lunches, standing extras list.

## Recipes & photos

Dinner recipes live in `src/dishes.js`: ~47 real dishes with per-serving ingredient
gram counts, method steps and derived allergens. Nutrition comes from the per-100g
table in the same file (UK CoFID approximations) — never guessed per dish. Each dish
has a photo in `public/photos/<dish-id>.jpg`, generated with `node scripts/photos.mjs`
(Gemini image API; resumes where it left off, only creating missing photos).

## Structure

- `src/dishes.js` — the dish library + ingredient nutrition table
- `src/data.js` — breakfasts, quiz options, daily reference intakes
- `src/engine.js` — targets (Mifflin-St Jeor), dish filtering/paging, portion scaling, stock builder
- `src/ocado.js` — Ocado shopping dictionary: search phrases, match rules, pack-size maths
- `src/ocado-products.js` — generated snapshot of matched M&S products (via `npm run ocado`)
- `scripts/ocado-fetch.mjs` — the product fetcher
- `src/Quiz.jsx` — paged onboarding quiz
- `src/Browser.jsx` — endless recipe browser + free-text ideas + nutrition panels
- `src/Breakfasts.jsx`, `src/Stock.jsx` — breakfast picker and weekly stock list
- `src/store.js` — localStorage persistence
