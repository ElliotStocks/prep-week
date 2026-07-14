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
- **Supermarket choice is a quiz question.** Ocado (M&S range) and Aldi are live;
  Tesco and Sainsbury's shown as "coming soon". Each supermarket = a matching dictionary
  + product snapshot refreshed by script (`npm run ocado` / `npm run aldi`; rules in
  `src/ocado.js` / `src/aldi.js`; registry in `src/supermarkets.js`). The shopping list
  shows the same week priced at the other supermarket ("The same week at Aldi: ≈ £X").
  Aldi quirk: its search ranking is unstable, so stubborn items use a `pin` (exact
  product URL, price read from the product page); ~13 pantry items aren't in Aldi's
  online range at all and fall back to search links. The app NEVER places an order;
  users always check out themselves.
- **Quiz (simplified July 2026 — replaced the per-person body-stats version):** one
  question per page, food questions only: supermarket → people count → allergies → dietary requirements (incl. keto, filtered on
  net carbs ≤15g) → foods enjoyed → free-text dislikes (organic toggle lives on the
  foods-enjoyed page) → appetite (portion size) + optional high-protein boost (+33% on each dish's main protein). No calorie/body-stat
  questions, no "how many dinners". "Prefer organic" overlays each supermarket's
  organic product map (captured by the fetch scripts from the same searches) wherever
  one exists — ~75 items at Ocado, ~9 at Aldi; prices update honestly.
- **Meal quantity lives on the card, not in the quiz:** picking a meal covers 1 night;
  a +/- stepper adds nights ("cook once, eat N nights"). Portions = people × appetite.
- **Price per portion on everything** — computed from real pack prices pro-rata by
  grams used. The planned differentiator: "this week's dinners: £X at supermarket Y".
- **Allergies are hard rules**, checked at recipe level now and at product-label
  level eventually. Open question: per-allergy "strict (block may-contain traces)".
- **No cuisine genres as preferences** — whole-foods focus; preferences are proteins/foods.
- **The shop covers the whole kitchen week:** dinners, breakfasts, spices, staples,
  plus a "Snacks & essentials" picker as a third segment on the Meals page
  (src/Extras.jsx view, catalogue in src/extras.js — ~43 household/snack products,
  same real-product matching, state.extras with pack steppers; chosen items appear
  as a section on the shopping list). Pantry memory prevents re-buying spices/staples every week.
  Full-catalogue supermarket mapping was consciously deferred: bundle size, scrape
  load and ToS risk — the staging is curated extras now, category-on-demand if
  needed, official data partnerships later.
- **Recipes are real, named dishes** (never template permutations — Elliot rejected the
  v1 combinatorial engine as "all very very similar"): ~115 dishes in `src/dishes.js`
  spanning distinct formats (soups, stews, traybakes, curries, one-pot rice, noodle
  bowls, bakes, salads; 14 vegan, 13 keto) with photos in `public/photos/`
  (`node scripts/photos.mjs` regenerates missing ones via Gemini). Browser shows 24 at
  a time, refresh pages through a stable shuffle, picks stay pinned. "Type anything"
  matches the closest dish (with a friendly miss message); live AI generation is still
  planned. A "Cooking" tab shows every picked meal's method with ingredient quantities
  scaled to the household; the shopping list has a copy-to-clipboard button, per-line
  remove ("not buying") and buy-fewer-packs controls (state.listTweaks), and a
  "Start a new week" reset (keeps profile, favourites, pantry memory). Dish cards have
  a favourites heart (state.favourites, floats favourites to the top). The meals page
  shows a supermarket badge (no brand logos — trademark caution).
  Settings edits keep the week's picks (only newly-disallowed dishes are dropped).
- **Nutrition from real data** (UK CoFID per-100g approximations in `src/dishes.js`),
  macros AND micros with % daily values — never AI-guessed numbers. Old saves migrate
  automatically in `src/store.js` (body-stats profiles → simple profiles).

## Open questions (Elliot hasn't decided yet)

- Lunches: leftovers from batch dinners, own picks, or out of scope?
- "May contain traces" blocking: strict vs standard, per allergy?
- Custom domain (app still lives on the free github.io address); which supermarket
  to add third — Tesco or Sainsbury's.

## Live deployment (shipped July 2026)

Public repo `ElliotStocks/prep-week`, hosted on GitHub Pages at
https://elliotstocks.github.io/prep-week/ — installable web app (manifest + service
worker). Pushing to main auto-deploys; a GitHub Action also refreshes all Ocado
prices nightly at 03:30 UTC and republishes. Photos are generated locally only
(`node scripts/photos.mjs` needs the Gemini key on this Mac), so run it before
pushing when dishes are added.

## Roadmap

1. ~~Ship it~~ — live on GitHub Pages, July 2026. Custom domain still to come.
2. ~~Second supermarket~~ — Aldi live July 2026, with per-week price comparison on the
   shopping list. Next: Tesco or Sainsbury's via the same pattern.
3. **Ordering — Pepesto piloted July 2026 and REJECTED for launch.** Pilot (~€1.66 of
   Elliot's €29.90 credit pack; key in ~/.pepesto-key.json, never in repo; script in
   scripts/pepesto-pilot.mjs) proved: matching too fuzzy (20%-fat mince for lean, lost
   lines), desktop flow dead-ends into a Pepesto-branded "install our app" QR screen
   (~90s compose), and the QR loses the session — lands on the App Store with an empty
   basket. Their app is a direct competitor with (Elliot's words) much worse UX than
   ours. Credits never expire — keep for /products probing during the Tesco build.
   REVISED ordering path (sequencing per Elliot July 2026: finish a clean app with
   all supermarkets FIRST, then monetise): (a) remaining supermarkets (Tesco,
   Sainsbury's); (b) affiliate links for new-customer bounties; (c) our own
   browser-extension basket assistant, desktop first (fee stays ours); (d) mobile
   interim = copy list + deep links; (e) retailer partnerships when user numbers
   justify. Whisk/Samsung (partnership-gated) still worth one email.
   Pepesto support (Angel) re-engaged July 2026: session hand-off failure confirmed
   in their logs (client stopped after first /checkout turn — awaiting Elliot's device
   info); embed tested with their official dockable.js — works on their demo only
   because pepesto.com→app.pepesto.com is same-site; from third-party origins the app
   renders blank (no frame-blocking headers; likely storage partitioning). They advise
   checkout automation only works reliably on the end user's device (= endorses our
   extension plan) and suggest running their engine inside one's OWN mobile app —
   a real future option for a Prep Week app. Branding of hosted flow: not available,
   open to co-developing. Text-input compose speedup promised in 2-3 weeks.
4. **AI recipes:** wire the type-anything box to live Claude generation for dishes
   outside the library.
5. **Later:** per-person meal variants, lunches, extras list, product-label allergy checks.
