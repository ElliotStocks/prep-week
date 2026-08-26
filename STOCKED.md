# Stocked — build backlog

The working list for autonomous sessions. **Read this first, work top-down, tick things
off as you finish them, and commit the tick with the work.** This file is the memory
between loop iterations — if it isn't written down here, the next iteration won't know.

Rules for every iteration:

- **One task per iteration.** Finish it properly rather than starting three.
- **Verify before committing.** `npm run build` must pass and the change must be
  checked in the browser preview (see CLAUDE.md). No "should work".
- **Push live only when green.** Elliot's call, July 2026: build green + verified in
  browser = push to main, which auto-deploys.
- **Never invent scope.** If a task turns out to need a decision Elliot hasn't made,
  stop, write the question under "Blocked — needs Elliot" below, and move to the next
  unblocked task. Don't guess on anything user-visible or irreversible.
- **Report honestly.** A supermarket that won't scrape is a finding, not a failure —
  write it down. Never ship placeholder or stale prices as if they were real.
- **Keep the existing quality bar:** real named dishes, real CoFID nutrition, real
  product prices, allergies as hard rules.

---

## Phase 0 — Rename to Stocked

The app is called **Stocked** now (was Prep Week).

- [x] Rename in the UI: `src/App.jsx` header, `index.html` title, welcome copy
- [x] `public/manifest.webmanifest` — name, short_name
- [x] `public/sw.js` — cache name (bumped to stocked-v3 so old caches clear)
- [x] `README.md` and `CLAUDE.md` — title and all "Prep Week" references (live-URL
      mentions still say prep-week — that IS the address until the repo moves)
- [x] `src/store.js` — key `mealprep-state-v1` → `stocked-state-v1`, **reading the old
      key once and migrating it** so nobody (including Elliot) loses their saved week
- [ ] Decide + do the repo/URL move — see "Blocked" below before touching this

## Phase 1 — The new quiz

Existing questions to keep: supermarket, household steppers, allergies, diet, likes,
dislikes, appetite. Everything below is new or changed. Quiz lives in `src/Quiz.jsx`,
state shape in `src/store.js` (add a migration for every new field).

- [x] **Which days?** Mon–Sun multi-select (after the household question; at least
      one night required). Profile stores `days`; old saves migrate to all seven.
      Picks bar now reads "N of M nights planned" against the chosen days.
- [x] **Budget** — tiles (under £40 / £40–60 / £60–80 / £80+ / no limit), after the
      nights question. profile.budget (band key) with caps in data.js BUDGET_OPTIONS;
      old saves migrate to no-limit. Engine wiring is Phase 2.
- [x] **Quick and easy** — own question ("How much cooking do you fancy?") storing
      profile.quickEasy; engine floats ≤30-min dishes to the front as a bias, never
      a filter. Likes stay the stronger signal.
- [x] **Cooking equipment** — icon tiles: oven, hob, air fryer, microwave, slow cooker,
      grill/griddle, pressure cooker, blender. Defaults per spec (gadgets unticked);
      at least one required; profile.equipment with migration. Dish-side filtering
      is the Phase 2 task.
- [x] Update the quiz progress indicator and the "seven quick questions" copy to match
      the real number of questions (progress was already dynamic; welcome copy now
      reads QUIZ_QUESTION_COUNT, sanity-checked against the pages array).

## Phase 2 — Engine: equipment + budget

- [x] Add `equipment: [...]` to every dish in `src/dishes.js` (all 115 tagged from
      their method steps; "grill OR pan-fry" and batch-note microwave mentions
      correctly don't count as requirements). allowedDishes filters on it as a hard
      rule; profiles without the field see everything. Split: 102 hob, 34 oven,
      1 blender.
- [x] Add an `effort` signal for "quick and easy" — CHECKED, resolved without code:
      113/115 dishes have exactly 4 method steps (correlation mins~steps = 0.06), so
      steps count carries no signal. Cook time (mins) IS the effort measure and the
      quick-easy bias already uses it. Revisit only if future dishes vary widely in
      step count.
- [x] Budget in `src/engine.js`: picks bar shows "est. £X of £Y" (amber >80%, red
      over), a friendly note appears when over with the three honest outs (swap /
      fewer packs / raise it), and with any budget set cheap dishes (≤£2.50/serving)
      float forward as a third sort key. Nothing is ever blocked.

## Phase 3 — Weekly rotation of shown dishes

Elliot's own words: *"I'm picking from the same few options every week."* This is the
highest-value small fix in the list — do it early.

- [x] Seed the browser's shuffle on the ISO week number so the opening 24 dishes change
      every Monday and are stable within a week (done in engine.js generateRecipes;
      verified 18/24 of the opening dishes differ next Monday).
- [x] Favourites, current picks and custom ideas stay pinned regardless of rotation
      (already structural: pinnedPicked/customRecipes render outside the shuffle,
      favourites sort on top of whatever is shown).
- [x] Sanity-check heavy filters: worst realistic corner (vegan + dairy/gluten
      allergies + hob-only kitchen) sees 8 dishes. Thin but honest — noted as a
      Phase 6 coverage priority (grow vegan/GF/hob-only dishes first).

## Phase 4 — Favourites section

- [x] A proper Favourites section/tab — new "♥ Favourites · N" segment on the Meals
      page showing every hearted dish (whether or not this week's shuffle surfaces
      it) with full cards: Add, nights stepper, nutrition, unheart.
- [x] Empty state that explains how to add one (verified: unhearting the last
      favourite shows it live).

## Phase 5 — Rate your meals

- [x] Once a week, prompt for ratings of the meals actually cooked — thumbs card on
      the Meals page, one tap each, Skip link. Timer arms when a week first has
      picks, fires 7 days later, resets on skip or completion. No nagging.
- [x] Store as `state.ratings` — `{dishId: {score: 1|-1, ratedAt}}`, with migration
      (plus state.ratingPromptedAt for the weekly timer).
- [x] Feed ratings into the browser's ordering — leading soft signal ahead of likes/
      quick/cheap. Verified: 👍 dish becomes first suggestion, 👎 dish drops out of
      the opening 24 but stays reachable.
- [x] Keep it local. All in localStorage, card says "Stays on this device".

## Phase 6 — 500+ recipes

Currently 115 in `src/dishes.js`. Target 500+. **Batches of 25.**

Each batch: write the dishes (real named dishes, distinct formats — never template
permutations), add any new ingredients to the `NUTRITION` table with real CoFID-based
per-100g values, add those ingredients to **every** live supermarket dictionary, tag
equipment and cook time, then generate photos.

- [x] Batch 1 (→140) · [ ] Batch 2 (→165) · [ ] Batch 3 (→190) · [ ] Batch 4 (→215)
- [ ] Batch 5 (→240) · [ ] Batch 6 (→265) · [ ] Batch 7 (→290) · [ ] Batch 8 (→315)
- [ ] Batch 9 (→340) · [ ] Batch 10 (→365) · [ ] Batch 11 (→390) · [ ] Batch 12 (→415)
- [ ] Batch 13 (→440) · [ ] Batch 14 (→465) · [ ] Batch 15 (→490) · [ ] Batch 16 (→515)
- [ ] Split `dishes.js` once it gets unwieldy (it's already 115KB at 115 dishes — at
      500 it's ~500KB and needs splitting and/or lazy loading)

**Photos:** `node scripts/photos.mjs` (skips dishes that already have one, so it's
resumable). After each batch, **report the photo cost for that batch to Elliot** —
he asked to see it accumulate so he can stop any time.

**Coverage to aim for while writing:** PRIORITY FINDING (Aug 2026): vegan +
gluten-free + hob-only currently yields just 8 dishes — weight early batches
toward vegan/GF one-pot hob dishes.

**Also:** keep the spread of formats wide (soups, stews,
traybakes, curries, one-pot rice, noodle bowls, bakes, salads, grills, air-fryer,
slow-cooker) and keep growing the vegan / keto / low-carb / kid-friendly counts, since
those are the users most likely to run out of options.

## Phase 7 — All eight supermarkets

Live now: Ocado (M&S range), Aldi. Wanted: Tesco, Sainsbury's, Asda, Morrisons,
Co-op, M&S, Waitrose.

Pattern to copy exactly — `src/ocado.js` / `src/aldi.js` (matching rules),
`scripts/*-fetch.mjs` (snapshot fetcher), `src/supermarkets.js` (registry).

Do them **one at a time**, easiest first, and prove each one end-to-end before starting
the next. Suggested order (revise on contact with reality):

- [ ] Sainsbury's
- [ ] Waitrose
- [ ] M&S (own site — note Ocado already carries the M&S range, so check for overlap
      before duplicating work)
- [ ] Morrisons
- [ ] Co-op
- [ ] Asda
- [ ] Tesco (expect the hardest bot protection — leave till last, and if it won't go,
      say so plainly rather than half-shipping it)

Per supermarket, done means: fetcher runs clean, every ingredient in the library
matches a real product (or is honestly flagged as unavailable, like Aldi's ~13 pantry
gaps), organic map captured, prices verified against the real site by spot-check, and
the registry entry live so it's selectable in the quiz.

- [ ] **Lazy-load product snapshots.** Two supermarkets is already ~220KB of JS in the
      bundle. Eight, with a 500-dish ingredient list, is multiple MB — the user should
      only download the one they shop at.
- [ ] Update the "same week at X" comparison to work across more than two.
- [ ] Extend the nightly refresh Action to all live supermarkets (it already fails
      independently per supermarket with warnings — keep that).

## Phase 8 — Product pictures on the shopping list

- [ ] Capture product image URLs in every fetcher (retrofit Ocado + Aldi).
- [ ] Show a thumbnail per shopping-list line in `src/Stock.jsx`.
- [ ] Lazy-load images and keep the list fast; handle missing images gracefully.
- [ ] Check licensing/hotlinking before shipping — see "Blocked" below.

---

## Blocked — needs Elliot

Add to this list rather than guessing. Elliot answers these when he's back.

- **Repo and URL rename.** Renaming `prep-week` → `stocked` on GitHub changes the live
  address to `elliotstocks.github.io/stocked/`. GitHub redirects the old URL, but the
  installed web app on his phone is scoped to the old path and may need reinstalling,
  and it changes `base` in `vite.config.js`. Also interacts with the custom domain he
  hasn't bought yet — buying the domain first would make this a one-time move instead
  of two. **Question: rename the repo now, or keep the repo name and just rename the
  app in the UI until the domain is sorted?**
- **Product images.** Hotlinking supermarket product photos is a grey area on most
  retailers' terms, and self-hosting copies is worse. Affiliate programme membership
  usually grants image rights — which points at doing Phase 8 after the affiliate
  sign-ups. **Question: hold Phase 8 until he's in a programme, or ship it and accept
  the risk?**
- Still open from before: lunches in scope or not; strict vs standard "may contain
  traces" blocking.

## Decisions already made (don't re-ask)

- Email the shopping list: **dropped for now** (Aug 2026). Not in scope.
- Push live when the build is green — no need to wait for review.
- Photos: generate in batches, report cost per batch.
- Everything stays local-first: no accounts, no logins, no data upload.

## Progress log

Newest first. One line per iteration: what got done, what it cost, what broke.

- 2026-08-26 · Phase 6 Batch 3 done: 165→190. New ingredients: pak choi, mangetout,
  cashews (nuts allergen — verified a nut-allergic user never sees cashew dishes),
  pearl barley (gluten). Aldi range gaps: mangetout + pearl barley join the honest
  fallback list (pak choi £1.29, cashews £1.69 priced fine). 25 photos ≈ $0.97.
  Build green, pushed.
- 2026-08-26 · Phase 6 Batch 2 done: 140→165. First new ingredients (butternut
  squash, paneer, butter beans, bacon lardons) added to NUTRITION + both
  dictionaries; fetchers re-run with rule fixes (Ocado paneer was matching a ready
  meal, Aldi butternut a ravioli — both corrected to honest products). Paneer not
  in Aldi's online range → joins the known fallback list. Verified on the shopping
  list: Everest Paneer Block £2.55, M&S Butter Beans £0.55. 25 photos ≈ $0.97.
  Build green, pushed.
- 2026-08-26 · Phase 6 Batch 1 done: 115→140 dishes, all composed from the existing
  99 priced ingredients (zero new dictionary work, priced at both supermarkets).
  11 vegan — the vegan+GF+hob-only corner went 8→19 dishes. 25 photos generated,
  0 failures; cost ≈ $0.97 (~£0.76) at Gemini image rates. Build green, verified
  in browser as a vegan hob-only Aldi user, pushed.
- 2026-08-26 · Phase 5 COMPLETE. Weekly thumbs ratings live end-to-end: card,
  storage, ordering feedback (verified both directions in browser). Build green,
  pushed. Phases 0-5 all done in one day; next is the 500-recipe grind.
- 2026-08-26 · Phase 4 COMPLETE. Favourites section live as a Meals segment with
  count badge and empty state; verified in browser both populated and empty. Build
  green, pushed.
- 2026-08-26 · Phase 3 COMPLETE. Weekly rotation live: shuffle seeded on ISO week
  (202635), browser matches predicted order, 18/24 opening dishes change on Monday,
  pinning intact. Heavy-filter corner (vegan+GF+hob) = 8 dishes → Phase 6 priority.
- 2026-08-26 · Phase 2 COMPLETE. Budget engine live: running total vs cap in the
  picks bar, over-budget warning verified in browser (£43.45 of £40, red + note),
  cheap-dish bias when a budget is set. Build green, pushed.
- 2026-08-26 · Phase 2 effort checkbox resolved by measurement: steps count adds no
  signal over mins (113/115 dishes have 4 steps). No code change needed.
- 2026-08-26 · Phase 2 equipment filtering live: 115 dishes tagged, engine hides
  dishes needing kit you lack. Verified: no-oven kitchen sees exactly 81 dishes,
  zero traybakes/roasts/pies in the browser. Build green, pushed.
- 2026-08-26 · Phase 1 COMPLETE. Welcome copy counts the real questions (eleven).
  Build green, pushed.
- 2026-08-26 · Phase 1 equipment question live: 8 tiles, sensible defaults, stored
  with migration. Verified in browser (toggled air fryer on / microwave off,
  persisted correctly). Build green, pushed.
- 2026-08-26 · Phase 1 quick-and-easy live: quiz question + engine bias. Verified in
  browser: preference on → first 12 dishes all ≤30 min; off → natural mix. Build
  green, pushed.
- 2026-08-26 · Phase 1 budget question live: five bands incl. no-limit, stored as
  profile.budget with migration; summary line shows the band. Verified end-to-end in
  the browser (u60 persisted to localStorage). Build green, pushed.
- 2026-08-26 · Phase 1 "Which nights?" question live: Mon–Sun chips in the quiz,
  profile.days with migration, picks bar shows "N of M nights planned". Walked the
  full quiz in the browser (guard against zero nights verified). Build green, pushed.
- 2026-08-26 · Phase 0 rename done (UI, manifest, SW cache bump, docs, localStorage
  migration verified in browser with a seeded old-key save). Repo/URL move still
  blocked on Elliot. Build green. Pushed live. No photo spend.
