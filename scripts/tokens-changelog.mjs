// CHANGELOG токенов: дифф ЗНАЧЕНИЙ tokens/tokens.json между двумя ревизиями (тегами).
// Описания (role, use, about, $description…) не считаются — только то, что попадает в CSS / Swift / Kotlin.
//
//   node scripts/tokens-changelog.mjs                  # последний тег v* → рабочее дерево
//   node scripts/tokens-changelog.mjs v0.3.0 v0.4.0    # между тегами
//   node scripts/tokens-changelog.mjs --to v0.4.0      # предыдущий тег v* → v0.4.0 (заметки релиза)
//   node scripts/tokens-changelog.mjs --write          # вписать раздел «Токены» в CHANGELOG.md под текущей версией
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = 'tokens/tokens.json';
const META = new Set([
  '$description',
  'role',
  'use',
  'about',
  'name',
  'figma',
  'source',
  'fallback',
  'file',
  'android',
]);

const argv = process.argv.slice(2);
const write = argv.includes('--write');
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const positional = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--to');
const [fromArg] = positional;
const toArg = flag('--to') ?? positional[1];

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function lastTag(before) {
  try {
    return git('describe', '--tags', '--abbrev=0', '--match', 'v*', ...(before ? [`${before}^`] : []));
  } catch {
    return null; // тегов ещё нет
  }
}

function readAt(ref) {
  if (!ref) return JSON.parse(readFileSync(FILE, 'utf8'));
  try {
    return JSON.parse(git('show', `${ref}:${FILE}`));
  } catch {
    return {}; // файла в этой ревизии не было
  }
}

/** Плоская карта путь → значение; массив чисел (шкала, cubic-bezier) — одно значение. */
function flatten(node, prefix = '', out = new Map()) {
  if (node === null || typeof node !== 'object' || (Array.isArray(node) && node.every((v) => typeof v !== 'object'))) {
    out.set(prefix, Array.isArray(node) ? `[${node.join(', ')}]` : String(node));
    return out;
  }
  for (const [k, v] of Object.entries(node)) {
    if (META.has(k)) continue;
    flatten(v, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

/** Ссылку `{группа.имя}` разворачиваем в итоговое значение: замена hex на ту же ссылку — не изменение. */
function resolver(map) {
  const find = (ref) => {
    const [group, ...rest] = ref.split('.');
    const name = rest.join('.');
    if (map.has(ref)) return [map.get(ref)];
    // color.accent → color.<подгруппа>.accent.light / .dark
    return [...map.keys()]
      .filter((k) => k.startsWith(`${group}.`) && `.${k}.`.includes(`.${name}.`))
      .map((k) => map.get(k));
  };
  const resolve = (v, depth = 0) =>
    depth > 5
      ? v
      : v.replace(/\{([^}]+)\}/g, (m, ref) => {
          const vals = find(ref);
          return vals.length ? vals.map((x) => resolve(x, depth + 1)).join(' / ') : m;
        });
  return resolve;
}

const to = toArg ?? null; // null — рабочее дерево
const from = fromArg ?? lastTag(to);
const a = flatten(readAt(from));
const b = flatten(readAt(to));

const added = [...b.keys()].filter((k) => !a.has(k));
const removed = [...a.keys()].filter((k) => !b.has(k));
const ra = resolver(a);
const rb = resolver(b);
const changed = [...b.keys()].filter((k) => a.has(k) && ra(a.get(k)) !== rb(b.get(k)));
const shown = (v, r) => (r(v) === v ? code(v) : `${code(v)} → ${code(r(v))}`);

const code = (s) => '`' + s.replace(/`/g, "'").replace(/\|/g, '\\|') + '`';
const lines = [];
const title = `Токены: ${from ?? 'начало'} → ${to ?? 'текущее'}`;
if (!from) {
  lines.push(`Первый релиз с журналом токенов: ${b.size} значений.`);
} else if (!added.length && !removed.length && !changed.length) {
  lines.push('Значения токенов не менялись.');
} else {
  if (removed.length) {
    lines.push(`**Удалены (${removed.length})** — ломающее изменение, нужен major:`, '');
    for (const k of removed) lines.push(`- ${code(k)} (было ${code(a.get(k))})`);
    lines.push('');
  }
  if (changed.length) {
    lines.push(`**Изменены (${changed.length}):**`, '', '| Токен | Было | Стало |', '|---|---|---|');
    for (const k of changed) lines.push(`| ${code(k)} | ${shown(a.get(k), ra)} | ${shown(b.get(k), rb)} |`);
    lines.push('');
  }
  if (added.length) {
    lines.push(`**Добавлены (${added.length}):**`, '');
    for (const k of added) lines.push(`- ${code(k)} = ${shown(b.get(k), rb)}`);
    lines.push('');
  }
}
const body = lines.join('\n').trimEnd();

if (!write) {
  console.log(`### ${title}\n\n${body}`);
  process.exit(0);
}

// --write: после `changeset version` в CHANGELOG.md первым идёт раздел «## <версия>» — дописываем в его конец
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const path = 'CHANGELOG.md';
if (!existsSync(path)) {
  console.error('CHANGELOG.md нет — сначала `npx changeset version`');
  process.exit(1);
}
const log = readFileSync(path, 'utf8');
const head = `## ${version}\n`;
const start = log.indexOf(head);
if (start === -1) {
  console.error(`В CHANGELOG.md нет раздела «## ${version}» — сначала \`npx changeset version\``);
  process.exit(1);
}
const next = log.indexOf('\n## ', start + head.length);
const end = next === -1 ? log.length : next + 1;
const section = log.slice(start, end);
if (section.includes('### Токены')) {
  console.log(`CHANGELOG.md: раздел «Токены» для ${version} уже есть`);
  process.exit(0);
}
const insert = `${section.trimEnd()}\n\n### Токены\n\n_${from ?? 'начало'} → v${version}_\n\n${body}\n\n`;
writeFileSync(path, log.slice(0, start) + insert + log.slice(end));
console.log(
  `CHANGELOG.md: раздел «Токены» добавлен в ${version} (${added.length} +, ${changed.length} ~, ${removed.length} −)`,
);
