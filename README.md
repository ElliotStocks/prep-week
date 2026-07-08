# Prep Week

A personal meal-prep planner. A detailed onboarding quiz (one question per page, every
eater gets their own body-stats pages) computes per-person daily calorie and protein
targets, then an endless recipe browser suggests whole-food meals to batch-cook across
the week. Picked meals build a full weekly kitchen stock list: fresh food, breakfasts,
spices and cupboard staples, with a pantry memory so staples aren't re-bought.

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
  recipe the built-in engine can make) and photo generation per recipe.
- v3: per-person meal variants, lunches, standing extras list.

## Structure

- `src/data.js` — ingredient catalogue with per-100g nutrition (approximated from UK CoFID)
- `src/engine.js` — targets (Mifflin-St Jeor), recipe generation, portion scaling, stock builder
- `src/ocado.js` — Ocado shopping dictionary: search phrases, match rules, pack-size maths
- `src/ocado-products.js` — generated snapshot of matched M&S products (via `npm run ocado`)
- `scripts/ocado-fetch.mjs` — the product fetcher
- `src/Quiz.jsx` — paged onboarding quiz
- `src/Browser.jsx` — endless recipe browser + free-text ideas + nutrition panels
- `src/Breakfasts.jsx`, `src/Stock.jsx` — breakfast picker and weekly stock list
- `src/store.js` — localStorage persistence
