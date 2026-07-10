# Prep Week — project instructions

Personal meal-prep and recipe web app for Elliot, now aimed at becoming a consumer
product. This is a personal project, completely separate from his Plexus Partners
recruitment work — never touch `~/Desktop/Plexus-tools` from sessions in this project.

Elliot is not a developer: explain things in plain English, avoid jargon, and run the
app for him rather than giving him commands where possible (`npm run dev`, opens at
http://localhost:5173).

## What the app is

A quiz-driven weekly meal planner: short food-only quiz → real-dish recipe browser
with photos and price-per-portion → breakfasts → full weekly shopping list matched to
real supermarket products with prices. All data in localStorage, no accounts.

## Locked design decisions

(Re-agreed July 2026 when Elliot pivoted from personal tool to shippable product.)

- **Product direction:** a simple app anyone can use, no logins. Ship as a hosted
  installable web app first; app stores later. Ordering/basket-filling comes AFTER the
  core product is good — parked, not dropped. Long-term data/ordering path: prove with
  scraped snapshots per supermarket, then supermarket affiliate/API partnerships.
- **Supermarket choice is a quiz question.** Ocado (M&S range) is live; Tesco and
  Sainsbury's shown as "coming soon". Each supermarket = a matching dictionary + product
  snapshot refreshed by script (Ocado: `npm run ocado`, rules in `src/ocado.js`).
  The app NEVER places an order; users always check out themselves.
- **Quiz (simplified July 2026 — replaced the per-person body-stats version):** one
  question per page, food questions only: supermarket → people count → allergies →
  dietary requirements (incl. keto, filtered on net carbs ≤15g) → foods enjoyed →
  free-text dislikes → appetite (portion size) + optional high-protein boost (+33% on
  each dish's main protein). No calorie/body-stat questions, no "how many dinners".
- **Meal quantity lives on the card, not in the quiz:** picking a meal covers 1 night;
  a +/- stepper adds nights ("cook once, eat N nights"). Portions = people × appetite.
- **Price per portion on everything** — computed from real pack prices pro-rata by
  grams used. The planned differentiator: "this week's dinners: £X at supermarket Y".
- **Allergies are hard rules**, checked at recipe level now and at product-label
  level eventually. Open question: per-allergy "strict (block may-contain traces)".
- **No cuisine genres as preferences** — whole-foods focus; preferences are proteins/foods.
- **The shop covers the whole kitchen week:** dinners, breakfasts, spices, staples.
  Pantry memory prevents re-buying spices/staples every week.
- **Recipes are real, named dishes** (never template permutations — Elliot rejected the
  v1 combinatorial engine as "all very very similar"): ~58 dishes in `src/dishes.js`
  (incl. 10 keto) with photos in `public/photos/` (`node scripts/photos.mjs` regenerates
  missing ones via Gemini). Browser shows 24 at a time, refresh pages through a stable
  shuffle, picks stay pinned. "Type anything" matches the closest dish; live AI
  generation is still planned.
- **Nutrition from real data** (UK CoFID per-100g approximations in `src/dishes.js`),
  macros AND micros with % daily values — never AI-guessed numbers. Old saves migrate
  automatically in `src/store.js` (body-stats profiles → simple profiles).

## Open questions (Elliot hasn't decided yet)

- Lunches: leftovers from batch dinners, own picks, or out of scope?
- Standing extras list (milk, coffee, fruit, snacks) beyond recipe ingredients?
- "May contain traces" blocking: strict vs standard, per allergy?
- Hosting/domain for the public web app; second supermarket to add first.

## Live deployment (shipped July 2026)

Public repo `ElliotStocks/prep-week`, hosted on GitHub Pages at
https://elliotstocks.github.io/prep-week/ — installable web app (manifest + service
worker). Pushing to main auto-deploys; a GitHub Action also refreshes all Ocado
prices nightly at 03:30 UTC and republishes. Photos are generated locally only
(`node scripts/photos.mjs` needs the Gemini key on this Mac), so run it before
pushing when dishes are added.

## Roadmap

1. ~~Ship it~~ — live on GitHub Pages, July 2026. Custom domain still to come.
2. **Second supermarket** (Tesco or Sainsbury's) to prove the switcher + per-week price
   comparison between supermarkets.
3. **Ordering:** basket assistant in the user's own browser (extension model — the
   Honey pattern), then supermarket affiliate/API partnerships. A first manual run with
   Elliot's Ocado account stalled on Chrome extension site permissions — pick up there.
4. **AI recipes:** wire the type-anything box to live Claude generation for dishes
   outside the library.
5. **Later:** per-person meal variants, lunches, extras list, product-label allergy checks.
