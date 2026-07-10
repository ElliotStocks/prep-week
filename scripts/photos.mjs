// Generates one photo per dish via the Gemini image API, saved to
// public/photos/<dish-id>.jpg for the recipe browser. Skips dishes that already
// have a photo, so it can resume after rate limits or failures.
// Run with: node scripts/photos.mjs

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DISHES } from '../src/dishes.js';
import { BREAKFASTS } from '../src/data.js';

const MODEL = 'gemini-3.1-flash-image-preview';
const OUT = fileURLToPath(new URL('../public/photos', import.meta.url));
mkdirSync(OUT, { recursive: true });

// The Gemini key lives in the banana skill's MCP config, not the shell env.
const settings = JSON.parse(readFileSync(`${process.env.HOME}/.claude/settings.json`, 'utf8'));
const API_KEY = Object.values(settings.mcpServers || {})
  .map(s => s.env?.GOOGLE_AI_API_KEY).find(Boolean);
if (!API_KEY) { console.error('No GOOGLE_AI_API_KEY found in ~/.claude/settings.json'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// One consistent look across the whole library: overhead, daylight, rustic table.
const promptFor = d => {
  const items = d.ingredients || d.items;
  const mains = items.filter(i => i[2] === 'fresh').slice(0, 5).map(i => i[0]).join(', ');
  const detail = d.blurb ? ` (${d.blurb.toLowerCase()})` : ', a fresh homemade breakfast';
  return `Overhead flat-lay photograph of ${d.name.toLowerCase()}${detail}, ` +
    `featuring ${mains}, served in a simple ceramic bowl on a ` +
    `rustic oak table with a linen napkin. Steam gently rising, honest home cooking, ` +
    `slightly imperfect plating. Captured from directly above with a Canon EOS R5, 50mm ` +
    `lens at f/5.6, soft natural window light from the left, gentle shadows. ` +
    `Bon Appetit feature spread aesthetic. No text, no hands, no people.`;
};

async function generate(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '16:9', imageSize: '1K' },
    },
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.status === 429) { console.log(`  rate limited — waiting ${30 * attempt}s`); await sleep(30000 * attempt); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part) throw new Error(`no image: ${data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || 'unknown'}`);
    return Buffer.from(part.inlineData.data, 'base64');
  }
  throw new Error('rate limited after 3 attempts');
}

let done = 0, skipped = 0;
const failed = [];
const ALL = [...DISHES, ...BREAKFASTS];
for (const d of ALL) {
  const dest = `${OUT}/${d.id}.jpg`;
  if (existsSync(dest)) { skipped++; continue; }
  try {
    const png = await generate(promptFor(d));
    const tmp = `${OUT}/.tmp-${d.id}.png`;
    writeFileSync(tmp, png);
    // shrink to card size with macOS's built-in sips (no ImageMagick needed)
    execFileSync('sips', ['--resampleWidth', '640', '-s', 'format', 'jpeg',
      '-s', 'formatOptions', '80', tmp, '--out', dest], { stdio: 'pipe' });
    rmSync(tmp, { force: true });
    done++;
    console.log(`[${done + skipped}/${ALL.length}] ${d.id} ✓`);
  } catch (e) {
    failed.push(d.id);
    console.log(`[${done + skipped + failed.length}/${ALL.length}] ${d.id} FAILED: ${String(e.message).slice(0, 140)}`);
  }
  await sleep(6500); // stay inside free-tier requests-per-minute
}
console.log(`\nGenerated ${done}, skipped ${skipped} existing, failed ${failed.length}`);
if (failed.length) console.log(`Failed: ${failed.join(', ')}\nRe-run this script to retry just the failures.`);
