# Prep Week — project instructions

Personal meal-prep and recipe web app for Elliot. This is a personal project, completely
separate from his Plexus Partners recruitment work — never touch `~/Desktop/Plexus-tools`
from sessions in this project.

Elliot is not a developer: explain things in plain English, avoid jargon, and run the
app for him rather than giving him commands where possible (`npm run dev`, opens at
http://localhost:5173).

## What the app is

A quiz-driven weekly meal planner that will eventually fill an Ocado basket (M&S range).
Version 1 (committed July 2026) works end to end: quiz → per-person targets → endless
recipe browser → breakfasts → full weekly stock list. All data in localStorage.

## Locked design decisions (agreed in mockups, July 2026)

- **Supermarket:** M&S range via Ocado. No public API exists, so basket-filling will be
  browser automation, with a linked shopping list as fallback. The app NEVER places the
  order; Elliot always confirms checkout himself.
- **Quiz:** one question per page. Question 1 is ALWAYS "how many people are the meals
  for?" — then EVERY eater gets their own age / gender / weight+height / activity / goal
  pages. Then shared pages: allergies (for the whole table), dietary requirements, whole
  foods enjoyed, free-text dislikes, dinners to cover. "Recipes to cook" is NOT a quiz
  question — chosen at the browsing stage, dinners spread across however many are picked.
- **Allergies are hard rules**, checked at recipe level now and at Ocado product-label
  level in v2. Open question: per-allergy "strict (block may-contain traces)" toggle.
- **No cuisine genres** (Italian/Thai etc. rejected) — whole-foods focus; preferences are
  proteins/foods, not cuisines.
- **Batch cooking is the core mechanic:** e.g. 5 dinners from 3 recipes, "cook once,
  eat N nights", quantities scaled per person from their calorie targets.
- **The shop covers the whole kitchen week:** dinners, breakfasts, spices, staples.
  Pantry memory prevents re-buying spices/staples every week.
- **Recipes must feel endless** — never a fixed shortlist — plus a "type anything" box.
  v1 uses a combinatorial engine; v2 wires real AI generation + a photo per recipe.
- **Nutrition from real data** (UK CoFID approximations in `src/data.js`), macros AND
  micros with % daily values — never AI-guessed numbers.

## Open questions (Elliot hasn't decided yet)

- Lunches: leftovers from batch dinners, own picks, or out of scope?
- Standing extras list (milk, coffee, fruit, snacks) beyond recipe ingredients?
- "May contain traces" blocking: strict vs standard, per allergy?

## Roadmap

1. **v2 — Ocado:** match stock-list lines to real M&S products with prices; basket assistant.
2. **v2 — AI recipes:** wire the type-anything box and "more ideas" to Claude; recipe photos.
3. **v3:** per-person meal variants, lunches, extras list.
