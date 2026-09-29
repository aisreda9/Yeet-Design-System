// CHANGELOG токенов: дифф того, что получают потребители, между двумя ревизиями (тегами).
// Сравнивается сгенерированный src/tokens/tokens.generated.css — CSS-переменные по темам и брендам и классы
// типографики. Swift и Kotlin генерируются из той же модели под теми же именами, поэтому дифф CSS — это контракт.
// Смена формата tokens/tokens.json без изменения результата (например, переход на DTCG) здесь не видна — так и нужно.
//
//   node scripts/tokens-changelog.mjs                  # последний тег v* → рабочее дерево
//   node scripts/tokens-changelog.mjs v0.3.0 v0.4.0    # между тегами
//   node scripts/tokens-changelog.mjs --to v0.4.0      # предыдущий тег v* → v0.4.0 (заметки релиза)
//   node scripts/tokens-changelog.mjs --write          # вписать раздел «Токены» в CHANGELOG.md под текущей версией
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = 'src/tokens/tokens.generated.css';

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
  if (!ref) return readFileSync(FILE, 'utf8');
  try {
    return git('show', `${ref}:${FILE}`);
  } catch {
    return ''; // файла в этой ревизии не было
  }
}

/** Селектор блока → область: '' (база и светлая тема), 'dark', 'brand lime', 'brand lime dark', 'reduced-motion'. */
function scopeOf(selector, media) {
  if (media) return media.includes('reduced-motion') ? 'reduced-motion' : media.trim();
  const brand = selector.match(/\[data-brand='([^']+)'\]/)?.[1];
  const dark = /\[data-theme='dark'\](?!\))/.test(selector);
  if (brand) return `brand ${brand}${dark ? ' dark' : ''}`;
  return dark ? 'dark' : '';
}

/** Карта `область → (имя → значение)`: CSS-переменные и классы `.y-*` (типографика). */
function parse(css) {
  const scopes = new Map();
  const put = (scope, name, value) => {
    if (!scopes.has(scope)) scopes.set(scope, new Map());
    scopes.get(scope).set(name, value.replace(/\s+/g, ' ').trim());
  };
  const block = (selector, body, media) => {
    const sel = selector.trim();
    if (sel.startsWith('@')) return; // @font-face
    const scope = scopeOf(sel, media);
    const decls = body
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean);
    if (sel.startsWith('.')) {
      put(scope, sel, decls.join('; '));
      return;
    }
    for (const d of decls) {
      const m = d.match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/);
      if (m) put(scope, m[1], m[2]);
    }
  };
  let rest = css.replace(/\/\*[\s\S]*?\*\//g, '');
  rest = rest.replace(/@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g, (_, media, inner) => {
    for (const [, sel, body] of inner.matchAll(/([^{}]+)\{([^{}]*)\}/g)) block(sel, body, media);
    return '';
  });
  for (const [, sel, body] of rest.matchAll(/([^{}]+)\{([^{}]*)\}/g)) block(sel, body);
  return scopes;
}

/** `var(--x)` → итоговое значение: сначала в своей области, потом в базе. */
function resolver(scopes) {
  const base = scopes.get('') ?? new Map();
  const resolve = (v, scope, depth = 0) =>
    depth > 8
      ? v
      : v.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g, (m, name, fallback) => {
          const hit = scopes.get(scope)?.get(name) ?? base.get(name) ?? fallback;
          return hit === undefined ? m : resolve(hit, scope, depth + 1);
        });
  return resolve;
}

/** Плоская карта `имя · область` → { raw, value }. */
function flatten(css) {
  const scopes = parse(css);
  const resolve = resolver(scopes);
  const out = new Map();
  for (const [scope, vars] of scopes) {
    for (const [name, raw] of vars) out.set(scope ? `${name} · ${scope}` : name, { raw, value: resolve(raw, scope) });
  }
  return out;
}

const to = toArg ?? null; // null — рабочее дерево
const from = fromArg ?? lastTag(to);
const a = flatten(readAt(from));
const b = flatten(readAt(to));

const added = [...b.keys()].filter((k) => !a.has(k));
const removed = [...a.keys()].filter((k) => !b.has(k));
const changed = [...b.keys()].filter((k) => a.has(k) && a.get(k).value !== b.get(k).value);

const code = (s) => '`' + s.replace(/`/g, "'").replace(/\|/g, '\\|') + '`';
const shown = ({ raw, value }) => (raw === value ? code(raw) : `${code(raw)} → ${code(value)}`);

const lines = [];
const title = `Токены: ${from ?? 'начало'} → ${to ?? 'текущее'}`;
if (!from) {
  lines.push(`Первый релиз с журналом токенов: ${b.size} значений.`);
} else if (!added.length && !removed.length && !changed.length) {
  lines.push('Значения токенов не менялись.');
} else {
  if (removed.length) {
    lines.push(`**Удалены (${removed.length})** — ломающее изменение, нужен major:`, '');
    for (const k of removed) lines.push(`- ${code(k)} (было ${shown(a.get(k))})`);
    lines.push('');
  }
  if (changed.length) {
    lines.push(`**Изменены (${changed.length}):**`, '', '| Токен | Было | Стало |', '|---|---|---|');
    for (const k of changed) lines.push(`| ${code(k)} | ${shown(a.get(k))} | ${shown(b.get(k))} |`);
    lines.push('');
  }
  if (added.length) {
    lines.push(`**Добавлены (${added.length}):**`, '');
    for (const k of added) lines.push(`- ${code(k)} = ${shown(b.get(k))}`);
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
