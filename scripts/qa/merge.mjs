/**
 * Сводный отчёт QA из шардов: node scripts/qa/merge.mjs [--dir=qa/out]
 *
 * Читает <dir>/<папка>/report.json каждого шарда (`npm run qa -- --shard=K/N` пишет qa/out/shard-K/, в CI шарды приходят
 * артефактами qa-shard-K) и пишет <dir>/report.md и report.json в формате обычного `npm run qa`.
 *
 * Ошибка (exit 1): ошибка в любом шарде; шард K из N не отработал (нет отчёта); шарды собраны с разным набором историй;
 * история не проверена ни одним шардом или проверена двумя; проверки, которым нужен весь набор историй и которые шард
 * сам не делает: «лишний эталон» (qa/baseline/*.png, которого не снял ни один шард) и «устаревшее исключение» KNOWN.
 * Нет ни одного отчёта шарда — exit 2.
 *
 * Только node: в CI job «qa» запускает его без npm ci.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { renderReport, summaryLines } from './report.mjs';

const root = resolve(import.meta.dirname, '../..');
const dirArg = process.argv
  .slice(2)
  .find((a) => a.startsWith('--dir='))
  ?.slice(6);
const dir = resolve(root, dirArg ?? 'qa/out');
const rel = relative(root, dir) || '.';
const baseDir = join(root, 'qa/baseline');

/* ─── Отчёты шардов ─────────────────────────────────────────────────── */
const shards = [];
for (const name of existsSync(dir) ? readdirSync(dir).sort() : []) {
  const file = join(dir, name, 'report.json');
  if (!statSync(join(dir, name)).isDirectory() || !existsSync(file)) continue;
  const r = JSON.parse(readFileSync(file, 'utf8'));
  if (r.shard) shards.push({ ...r, dir: name });
}
if (!shards.length) {
  console.error(`Нет отчётов шардов в ${rel}/*/report.json (npm run qa -- --shard=K/N).`);
  process.exit(2);
}

/** @type {{level:string, check:string, story:string, theme:string, detail:string}[]} */
const errors = [];
const fail = (check, story, detail) => errors.push({ level: 'error', check, story, theme: '', detail });

const total = shards[0].shard.total;
const byIndex = new Map();
for (const s of shards) {
  if (s.shard.total !== total)
    fail(
      'шарды не совпадают',
      '—',
      `${s.dir}: шард ${s.shard.index}/${s.shard.total}, а у ${shards[0].dir} — из ${total}`,
    );
  else if (byIndex.has(s.shard.index))
    fail(
      'шарды не совпадают',
      '—',
      `шард ${s.shard.index}/${total} дважды: ${byIndex.get(s.shard.index).dir} и ${s.dir}`,
    );
  else byIndex.set(s.shard.index, s);
}
const missing = Array.from({ length: total }, (_, i) => i + 1).filter((k) => !byIndex.has(k));
for (const k of missing)
  fail(
    'шард не отработал',
    '—',
    `нет отчёта шарда ${k}/${total} — упал до конца прогона или не скачан; см. job «QA шард ${k}/${total}»`,
  );

const used = [...byIndex.values()];
const allKey = JSON.stringify([...used[0].all].sort());
for (const s of used)
  if (JSON.stringify([...s.all].sort()) !== allKey)
    fail(
      'шарды не совпадают',
      '—',
      `${s.dir}: другой набор историй (${s.all.length} против ${used[0].all.length}) — шарды собраны с разных коммитов`,
    );
for (const s of used)
  if (s.image !== used[0].image || s.visual !== used[0].visual)
    fail('шарды не совпадают', '—', `${s.dir}: другой образ или режим скриншотов`);

/* ─── Покрытие историй: объединение шардов = весь набор, без дублей ─── */
const all = used[0].all;
const seen = new Map();
for (const s of used)
  for (const id of s.ids) {
    if (seen.has(id)) fail('история в двух шардах', id, `${seen.get(id)} и ${s.dir}`);
    else seen.set(id, s.dir);
  }
if (!missing.length) for (const id of all) if (!seen.has(id)) fail('история не проверена', id, 'ни в одном шарде');

/* ─── Замечания шардов ──────────────────────────────────────────────── */
const issues = used.flatMap((s) => s.issues);
errors.push(...used.flatMap((s) => s.errors));
const warns = issues.filter((i) => i.level === 'warn');
const known = issues.filter((i) => i.level === 'known');
const specs = used.flatMap((s) => s.specs);
const sum = (k) => used.reduce((n, s) => n + s.counts[k], 0);
const visual = used[0].visual;
const filtered = used.some((s) => s.filtered);

/* ─── Проверки по всему набору (шард их не делает) ──────────────────── */
if (!missing.length && !filtered) {
  if (visual && existsSync(baseDir)) {
    const shot = new Set(used.flatMap((s) => s.shotFiles));
    for (const f of readdirSync(baseDir)
      .filter((f) => f.endsWith('.png') && !shot.has(f))
      .sort()) {
      errors.push({
        level: 'error',
        check: 'лишний эталон',
        story: f.replace(/--(light|dark)\.png$/, ''),
        theme: f.match(/--(\w+)\.png$/)?.[1] ?? '',
        detail: `qa/baseline/${f} — истории нет или она no-visual (play без тега visual); \`npm run qa -- --update-baseline\``,
      });
    }
  }
  for (const k of used[0].knownKeys)
    if (!known.some((i) => `${i.check}|${i.story}` === k))
      fail('устаревшее исключение', k.split('|')[1], `уберите из KNOWN в run.mjs: ${k}`);
}

/* ─── Отчёт ─────────────────────────────────────────────────────────── */
const screens = sum('screens');
const visualLine = visual
  ? `визуальная регрессия: сравнено ${sum('compared')}/${screens}, расхождений ${sum('diffs')}`
  : `визуальная регрессия: **не проверялась** (нет закреплённого образа${process.env.CI ? '' : ', локальный прогон'})`;
const specOk = specs.filter((s) => s.ok).length;
const shardLine = (s) => {
  const e = s.errors.length;
  return `| [${s.shard.index}/${total}](./${s.dir}/report.md) | ${s.ids.length} | ${s.counts.screens} | ${e ? `**${e}**` : 0} |`;
};
const report = {
  stories: seen.size,
  storiesNote: ` (${used.length} из ${total} шардов${filtered ? ', выборка --only / --changed' : ''})`,
  themes: 2,
  screens,
  specOk,
  specTotal: specs.length,
  visualLine,
  tapMin: used[0].tapMin,
  errors,
  known,
  warns,
  extra: [
    '| Шард | Историй | Скриншотов | Ошибок |',
    '|---|---|---|---|',
    ...used.map(shardLine),
    ...missing.map((k) => `| ${k}/${total} | — | — | **нет отчёта** |`),
  ],
};
writeFileSync(join(dir, 'report.md'), renderReport(report));
writeFileSync(
  join(dir, 'report.json'),
  JSON.stringify(
    {
      stories: seen.size,
      specs,
      issues: [...errors, ...known, ...warns],
      shards: used.map((s) => ({
        index: s.shard.index,
        total,
        dir: s.dir,
        stories: s.ids.length,
        errors: s.errors.length,
      })),
      missing,
    },
    null,
    2,
  ),
);

console.log(
  `Шарды ${used.length}/${total}: ${used.map((s) => `${s.shard.index} — ${s.ids.length}`).join(', ')} · всего историй ${all.length}, проверено ${seen.size}`,
);
for (const line of summaryLines({ ...report, file: `${rel}/report.md` })) console.log(line);
process.exit(errors.length ? 1 : 0);
