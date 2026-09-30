/**
 * Покрытие экранов и живые пути реестра. Требует собранный storybook-static (читает только index.json, браузер не нужен).
 * node scripts/qa/coverage.mjs [--strict]
 *
 * 1. Кадры New app design (design/figma-frames.json) × истории Pages/* × якоря flow-diff (design/figma-flows.json).
 *    Кадр связан с историей: по якорям (frames[slug].id → pages-экраны-флоу--<slug>), по тегу истории `figma:<node-id>`,
 *    по имени (имя истории = имя кадра) или по префиксу имени («Auth / Sign In» → «Auth / Sign In / Empty»).
 *    Пробелы — предупреждение (волна 2 доливает экраны), `--strict` делает их ошибкой.
 * 2. Путь `story` каждой строки src/docs/registry.ts существует в собранном Storybook — иначе ошибка.
 * 3. Слаг figma-flows.json без истории — ошибка (flow-diff такой экран не сверит).
 * 4. `figmaId` каждой строки реестра есть в снимке DS 0.2 (src/docs/figma-nodes.json) — иначе ошибка: узел удалён или перенесён.
 * Отчёт: qa/out/coverage.md.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, staticDir } from './lib.mjs';

const strict = process.argv.includes('--strict');
const read = (p) => readFileSync(join(root, p), 'utf8');
if (!existsSync(join(staticDir, 'index.json'))) { console.error('Нет storybook-static: сначала `npm run build-storybook`.'); process.exit(2); }

const entries = Object.values(JSON.parse(readFileSync(join(staticDir, 'index.json'), 'utf8')).entries);
const stories = entries.filter((e) => e.type === 'story');
const pages = stories.filter((e) => e.title.startsWith('Pages/'));
const byId = new Map(stories.map((e) => [e.id, e]));
const { frames: flowFrames } = JSON.parse(read('design/figma-flows.json'));
const frames = JSON.parse(read('design/figma-frames.json')).frames.map(([id, name, w, h]) => ({ id, name, w, h, screen: w === 393 && h >= 852 }));

const errors = [];
const norm = (s) => s.replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ').trim().toLowerCase();
const nodeId = (s) => s.replace('-', ':');
const link = (e) => `\`${e.id}\``;

// ─── Якоря flow-diff ────────────────────────────────────────────────
const anchored = new Map(); // node-id → { slug, story }
for (const [slug, f] of Object.entries(flowFrames)) {
  const story = byId.get(`pages-экраны-флоу--${slug}`);
  if (!story) errors.push(`figma-flows.json: у слага \`${slug}\` (${f.id}) нет истории \`pages-экраны-флоу--${slug}\` — flow-diff его не сверит`);
  if (!anchored.get(f.id)?.story) anchored.set(f.id, { slug, story });
}

// ─── Кадр → истории ─────────────────────────────────────────────────
const frameIds = new Set(frames.map((f) => f.id));
const linkedStories = new Set();
// Явная связь (якоря, тег) важнее имени: у одноимённых кадров («Stylist / Trips / List» ×2) история достаётся только своему
const explicit = new Map(); // story.id → имена кадров, с которыми история связана по node-id
const pin = (story, f) => story && explicit.set(story.id, [...(explicit.get(story.id) ?? []), norm(f.name)]);
for (const f of frames) {
  pin(anchored.get(f.id)?.story, f);
  for (const s of pages) if ((s.tags ?? []).some((t) => t.startsWith('figma:') && nodeId(t.slice(6)) === f.id)) pin(s, f);
}
const byName = (s, f) => !explicit.get(s.id)?.includes(norm(f.name));
for (const f of frames) {
  f.stories = []; // { story, how }
  const add = (story, how) => { if (story && !f.stories.some((s) => s.story === story)) { f.stories.push({ story, how }); linkedStories.add(story.id); } };
  add(anchored.get(f.id)?.story, 'якоря');
  for (const s of pages) if ((s.tags ?? []).some((t) => t.startsWith('figma:') && nodeId(t.slice(6)) === f.id)) add(s, 'тег');
  const name = norm(f.name);
  for (const s of pages) if (norm(s.name) === name && byName(s, f)) add(s, 'имя');
  // Префикс — только от двух сегментов («Раздел / Экран»), иначе «Wardrobe» съел бы весь раздел
  for (const s of pages) { const n = norm(s.name); if (n.split(' / ').length >= 2 && name.startsWith(`${n} / `) && byName(s, f)) add(s, 'префикс имени'); }
  f.anchors = anchored.has(f.id);
}
for (const s of pages) for (const t of s.tags ?? []) if (t.startsWith('figma:') && !frameIds.has(nodeId(t.slice(6)))) errors.push(`${link(s)}: тег \`${t}\` — такого кадра нет в design/figma-frames.json`);

// ─── Реестр: пути story ─────────────────────────────────────────────
// Путь — заголовок (`Atoms/Button`) или заголовок + имя истории (`Atoms/Button/Primary`)
const paths = new Set(entries.flatMap((e) => [e.title, `${e.title}/${e.name}`]));
const src = read('src/docs/registry.ts');
// Каждое `story: '…'` и ближайший перед ним `code: '…'` — строка реестра может занимать и несколько строк файла
const registry = [...src.matchAll(/story:\s*['"]([^'"]+)['"]/g)].map((m) => ({ story: m[1], code: [...src.slice(0, m.index).matchAll(/code:\s*['"]([^'"]+)['"]/g)].at(-1)?.[1] ?? '?' }));
if (!registry.length) errors.push('src/docs/registry.ts: не нашёл ни одной строки `story` — формат реестра изменился, поправь разбор в scripts/qa/coverage.mjs');
const dead = registry.filter((r) => !paths.has(r.story));
for (const r of dead) errors.push(`src/docs/registry.ts: \`${r.code}\` → story \`${r.story}\` — такого пути нет в Storybook`);

// ─── Реестр: figmaId есть на странице DS 0.2 ────────────────────────
const figmaNodes = JSON.parse(read('src/docs/figma-nodes.json')).nodes;
const figmaIds = [...src.matchAll(/figmaId:\s*['"]([^'"]+)['"]/g)].map((m) => ({ id: m[1], code: [...src.slice(0, m.index).matchAll(/code:\s*['"]([^'"]+)['"]/g)].at(-1)?.[1] ?? '?' }));
const lost = figmaIds.filter((f) => !figmaNodes[f.id]);
for (const f of lost) errors.push(`src/docs/registry.ts: \`${f.code}\` → figmaId \`${f.id}\` — такого узла нет в снимке DS 0.2 (src/docs/figma-nodes.json): узел удалён или перенесён, обнови снимок и реестр`);

// ─── Отчёт ──────────────────────────────────────────────────────────
const screens = frames.filter((f) => f.screen), overlays = frames.filter((f) => !f.screen);
const full = screens.filter((f) => f.stories.length && f.anchors);
const noAnchors = screens.filter((f) => f.stories.length && !f.anchors);
const noStory = screens.filter((f) => !f.stories.length);
const overlaysNoStory = overlays.filter((f) => !f.stories.length);
const orphans = pages.filter((s) => !linkedStories.has(s.id));
const warnings = [];
if (noStory.length) warnings.push(`кадров без истории: ${noStory.length} из ${screens.length} экранов`);
if (noAnchors.length) warnings.push(`экранов с историей, но без якорей flow-diff: ${noAnchors.length}`);

const cell = (f) => f.stories.map((s) => `${link(s.story)} (${s.how})`).join(', ') || '—';
const table = (list, cols = true) => list.length
  ? ['| Кадр | Имя | Размер | История |', '|---|---|---|---|', ...list.map((f) => `| \`${f.id}\` | ${f.name} | ${f.w}×${f.h} | ${cols ? cell(f) : '—'} |`), '']
  : ['Нет.', ''];
const lines = [
  '# Покрытие экранов: кадры Figma ↔ истории ↔ flow-diff', '',
  `Кадров New app design: ${frames.length} (экранов ${screens.length}, оверлеев ${overlays.length}). Историй Pages/*: ${pages.length}. Якорей flow-diff: ${Object.keys(flowFrames).length} экранов.`, '',
  `**Кадров без истории: ${noStory.length}** из ${screens.length} экранов. С историей и якорями: ${full.length}. С историей без якорей: ${noAnchors.length}. Оверлеев без истории: ${overlaysNoStory.length} из ${overlays.length}.`, '',
  `Реестр: ${registry.length} строк, мёртвых путей \`story\`: ${dead.length}, figmaId вне снимка DS 0.2: ${lost.length}.`, '',
  'Связь кадра с историей: «якоря» — `design/figma-flows.json` (надёжно, по node-id); «тег» — `tags: [\'figma:<node-id>\']` у истории; «имя» / «префикс имени» — имя истории совпадает с именем кадра или его началом (`Auth / Sign In` → все состояния входа). Префикс — эвристика: состояние экрана считается покрытым историей экрана.', '',
];
if (errors.length) lines.push('## Ошибки', '', ...errors.map((e) => `- ${e}`), '');
lines.push('## Экраны без истории', '', ...table(noStory, false));
lines.push('## Экраны с историей, но без якорей flow-diff', '', ...table(noAnchors));
lines.push('## Истории Pages/* без кадра', '', ...(orphans.length ? orphans.map((s) => `- ${link(s)} «${s.name}»`) : ['Нет.']), '');
lines.push('## Оверлеи без истории', '', 'Шторки, диалоги и тосты. Часть из них показывается поверх экрана с историей — для сведения.', '', ...table(overlaysNoStory, false));
lines.push('## Покрыто полностью (история и якоря)', '', ...table(full));
lines.push('## Оверлеи с историей', '', ...table(overlays.filter((f) => f.stories.length)));

mkdirSync(join(root, 'qa/out'), { recursive: true });
writeFileSync(join(root, 'qa/out/coverage.md'), lines.join('\n'));

const gh = !!process.env.GITHUB_ACTIONS;
for (const e of errors) console.log(gh ? `::error::${e.replaceAll('`', '')}` : `✗ ${e}`);
for (const w of warnings) console.log(gh ? `::warning::Покрытие экранов: ${w} (qa/out/coverage.md)` : `! ${w}`);
console.log(`\nЭкранов ${screens.length}: без истории ${noStory.length}, без якорей ${noAnchors.length}, полностью ${full.length}. Оверлеев без истории ${overlaysNoStory.length}/${overlays.length}. Историй без кадра ${orphans.length}. Реестр: мёртвых путей ${dead.length}/${registry.length}, figmaId вне Figma ${lost.length}/${figmaIds.length}. Отчёт: qa/out/coverage.md`);
if (errors.length || (strict && warnings.length)) process.exit(1);
