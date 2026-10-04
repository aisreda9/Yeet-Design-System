/**
 * Отчёт QA (qa/out/report.md) и деление историй на шарды — общее для run.mjs и merge.mjs.
 * Без зависимостей кроме node: merge.mjs в CI запускается без npm ci.
 */

/**
 * Шард из `--shard=K/N`: { index: K, total: N } или null. Ошибка формата — исключение.
 * @param {string | true | undefined} arg
 */
export function parseShard(arg) {
  if (arg === undefined) return null;
  const m = typeof arg === 'string' ? arg.match(/^(\d+)\/(\d+)$/) : null;
  const index = Number(m?.[1]),
    total = Number(m?.[2]);
  if (!m || total < 1 || index < 1 || index > total)
    throw new Error(`--shard=K/N, 1 ≤ K ≤ N: получено ${arg === true ? '--shard' : `--shard=${arg}`}`);
  return { index, total };
}

/**
 * Истории шарда K из N: сортировка по id и деление по кругу (i mod N). Детерминированно (зависит только от набора id),
 * и экраны Pages/* (у них ещё прогон на 320 и 430) расходятся по шардам поровну, а не попадают все в последний.
 * @template {{ id: string }} T
 * @param {T[]} stories
 * @param {{ index: number, total: number } | null} shard
 * @returns {T[]}
 */
export function shardStories(stories, shard) {
  if (!shard) return stories;
  return [...stories]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .filter((_, i) => i % shard.total === shard.index - 1);
}

const row = (i) => `| ${i.check} | \`${i.story}\` | ${i.theme} | ${String(i.detail).replace(/\|/g, '\\|')} |`;
const table = (title, list) =>
  list.length ? [title, ``, `| Проверка | История | Тема | Детали |`, `|---|---|---|---|`, ...list.map(row), ``] : [];

/** Счётчик замечаний по типу проверки, по убыванию. */
export const byCheck = (arr) =>
  Object.entries(arr.reduce((m, i) => ((m[i.check] = (m[i.check] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);

/**
 * Markdown отчёта. Строки «Историй: …» и «**Ошибок: N**» читают qa-baseline.yml и pr-drive — формат не менять.
 * @param {{ title?: string, stories: number, storiesNote?: string, themes: number, screens: number, specOk: number, specTotal: number,
 *   visualLine: string, tapMin: number, errors: any[], known: any[], warns: any[], extra?: string[] }} r
 */
export function renderReport(r) {
  return [
    `# ${r.title ?? 'QA Storybook'}`,
    ``,
    `Историй: **${r.stories}**${r.storiesNote ?? ''} × ${r.themes} темы · скриншотов: ${r.screens} · спеки Figma: **${r.specOk}/${r.specTotal}** · ${r.visualLine} · зона нажатия ≥ ${r.tapMin}`,
    ``,
    ...(r.extra?.length ? [...r.extra, ``] : []),
    `**Ошибок: ${r.errors.length}** · известных: ${r.known.length} · предупреждений: ${r.warns.length}`,
    ``,
    ...table(`## Ошибки`, r.errors),
    ...table(`## Известные нарушения (не валят CI)`, r.known),
    `## Предупреждения по типам`,
    ``,
    ...byCheck(r.warns).map(([k, n]) => `- ${k}: ${n}`),
    ``,
    `<details><summary>Все предупреждения</summary>`,
    ``,
    `| Проверка | История | Тема | Детали |`,
    `|---|---|---|---|`,
    ...r.warns.map(row),
    ``,
    `</details>`,
  ].join('\n');
}

/** Итоговая строка в лог: «Историй N · спеки … · ошибок X …» (её ищет pr-drive §4). */
export function summaryLines({ stories, specOk, specTotal, visualLine, errors, known, warns, file }) {
  return [
    `Историй ${stories} · спеки ${specOk}/${specTotal} · ${visualLine.replace(/\*\*/g, '')} · ошибок ${errors.length} · известных ${known.length} · предупреждений ${warns.length}`,
    ...byCheck(errors).map(([k, n]) => `  ✗ ${k}: ${n}`),
    ...byCheck(warns).map(([k, n]) => `  · ${k}: ${n}`),
    `Отчёт: ${file}`,
  ];
}
