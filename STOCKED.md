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

- [ ] Add `equipment: [...]` to every dish in `src/dishes.js` (start with the current
      115; new dishes get it at authoring time). A dish is only shown if the user has
      **all** its required equipment.
- [ ] Add an `effort` signal for "quick and easy" (cook time already exists — check
      whether steps count is needed too).
- [ ] Budget in `src/engine.js`: show the running weekly total against the chosen
      budget, warn when a pick would break it, and bias suggestions to fit. Never
      hard-block a pick — tell the truth, let the user decide.

## Phase 3 — Weekly rotation of shown dishes

Elliot's own words: *"I'm picking from the same few options every week."* This is the
highest-value small fix in the list — do it early.

- [ ] Seed the browser's shuffle on the ISO week number so the opening 24 dishes change
      every Monday and are stable within a week (`src/Browser.jsx`).
- [ ] Favourites, current picks and custom ideas stay pinned regardless of rotation.
- [ ] Sanity-check that a user with heavy filters (vegan + allergies + limited kit)
      still sees a full set, not four dishes.

## Phase 4 — Favourites section

- [ ] A proper Favourites section/tab, not just hearts floating to the top of the
      browser. State already exists (`state.favourites`).
- [ ] Empty state that explains how to add one.

## Phase 5 — Rate your meals

- [ ] Once a week, prompt for ratings of the meals actually cooked (simple — thumbs or
      1–5, one tap each, skippable). Do **not** nag: once per week, dismissible.
- [ ] Store as `state.ratings` — `{dishId: {score, ratedAt}}`, with migration.
- [ ] Feed ratings into the browser's ordering: highly rated float up, poorly rated
      sink (never hard-hidden — people change their minds).
- [ ] Keep it local. No accounts, no upload — same as everything else.

## Phase 6 — 500+ recipes

Currently 115 in `src/dishes.js`. Target 500+. **Batches of 25.**

Each batch: write the dishes (real named dishes, distinct formats — never template
permutations), add any new ingredients to the `NUTRITION` table with real CoFID-based
per-100g values, add those ingredients to **every** live supermarket dictionary, tag
equipment and cook time, then generate photos.

- [ ] Batch 1 (→140) · [ ] Batch 2 (→165) · [ ] Batch 3 (→190) · [ ] Batch 4 (→215)
- [ ] Batch 5 (→240) · [ ] Batch 6 (→265) · [ ] Batch 7 (→290) · [ ] Batch 8 (→315)
- [ ] Batch 9 (→340) · [ ] Batch 10 (→365) · [ ] Batch 11 (→390) · [ ] Batch 12 (→415)
- [ ] Batch 13 (→440) · [ ] Batch 14 (→465) · [ ] Batch 15 (→490) · [ ] Batch 16 (→515)
- [ ] Split `dishes.js` once it gets unwieldy (it's already 115KB at 115 dishes — at
      500 it's ~500KB and needs splitting and/or lazy loading)

**Photos:** `node scripts/photos.mjs` (skips dishes that already have one, so it's
resumable). After each batch, **report the photo cost for that batch to Elliot** —
he asked to see it accumulate so he can stop any time.

**Coverage to aim for while writing:** keep the spread of formats wide (soups, stews,
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
