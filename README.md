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

## Roadmap

- v2: Ocado (M&S range) product matching — every line on the stock list becomes a real
  product with a live price, plus a basket-filling assistant.
- v2: AI-generated recipes for the "type anything" box (currently matched to the closest
  recipe the built-in engine can make) and photo generation per recipe.
- v3: per-person meal variants, lunches, standing extras list.

## Structure

- `src/data.js` — ingredient catalogue with per-100g nutrition (approximated from UK CoFID)
- `src/engine.js` — targets (Mifflin-St Jeor), recipe generation, portion scaling, stock builder
- `src/Quiz.jsx` — paged onboarding quiz
- `src/Browser.jsx` — endless recipe browser + free-text ideas + nutrition panels
- `src/Breakfasts.jsx`, `src/Stock.jsx` — breakfast picker and weekly stock list
- `src/store.js` — localStorage persistence
