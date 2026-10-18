// Atualiza data/history.json com a XP atual dos personagens (TibiaData API v4).
// Requer Node 18+. Uso: node scripts/update.mjs
import { readFile, writeFile } from "node:fs/promises";

const API = process.env.TIBIADATA_API || "https://api.tibiadata.com/v4";
const cfg = JSON.parse(await readFile(new URL("../config.json", import.meta.url)));
const histPath = new URL("../data/history.json", import.meta.url);
let hist = {};
try { hist = JSON.parse(await readFile(histPath)); } catch {}

const norm = s => String(s).trim().toLowerCase();
const wanted = new Map(cfg.characters.map(c => [norm(c.name), c.name]));
const found = new Map();

async function get(path) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(API + path, { headers: { "user-agent": "painel-tibia" } });
      if (r.ok) return await r.json();
      if (r.status === 429) await new Promise(r => setTimeout(r, 5000 * (i + 1)));
    } catch {}
    await new Promise(r => setTimeout(r, 1500));
  }
  return null;
}

// 1) Highscores de experiência do mundo: trazem level e XP total (até 20 páginas de 50).
for (let page = 1; page <= 20 && found.size < wanted.size; page++) {
  const j = await get(`/highscores/${encodeURIComponent(cfg.world)}/experience/all/${page}`);
  const list = j?.highscores?.highscore_list;
  if (!list?.length) break;
  for (const e of list) {
    const key = norm(e.name);
    if (wanted.has(key) && !found.has(key)) found.set(key, { exp: e.value, level: e.level });
  }
  await new Promise(r => setTimeout(r, 400));
}

// 2) Quem não apareceu no top 1000: pega só o level pelo endpoint do personagem.
for (const [key, name] of wanted) {
  if (found.has(key)) continue;
  const j = await get(`/character/${encodeURIComponent(name.trim())}`);
  const lvl = j?.character?.character?.level;
  if (lvl) found.set(key, { exp: null, level: lvl });
  else console.warn(`Sem dados para ${name}`);
}

const today = new Date().toISOString().slice(0, 10);
for (const [key, name] of wanted) {
  const v = found.get(key);
  if (!v) continue;
  (hist[name] ??= {})[today] = v;
  console.log(name, today, v);
}
const sorted = Object.fromEntries(Object.entries(hist).map(([k, d]) => [k, Object.fromEntries(Object.entries(d).sort())]));
await writeFile(histPath, JSON.stringify(sorted));
await writeFile(new URL("../data/meta.json", import.meta.url), JSON.stringify({ updatedAt: new Date().toISOString() }));
