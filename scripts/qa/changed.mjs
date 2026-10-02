/**
 * `npm run qa:changed` (`npm run qa -- --changed`): какие истории затронуты изменениями ветки относительно origin/main
 * (или `--changed=<ref>`).
 * Только для локального ускорения — CI гоняет QA полностью.
 *
 * Изменения: diff --name-status от merge-base с origin/main (коммиты ветки + рабочее дерево) и неотслеживаемые файлы.
 * Правило выбора по каждому файлу:
 *   - токены, глобальные стили, конфиг Storybook, скрипты сборки и QA, зависимости → полный прогон (с причиной);
 *   - `*.stories.tsx` → все его истории + истории файлов, которые его импортируют (прототип собирает экраны из Pages);
 *   - модуль в `src/` (tsx, ts, svg, png, json…) → истории, чей граф импортов (статические импорты и import.meta.glob) его содержит;
 *   - CSS в `src/` → классы `y-*` изменённых правил (блок: `y-chip` из `.y-chip__toggle--x`) → модули с этим блоком в исходнике →
 *     истории над ними; изменение вне правила с классом `y-*` (`:root`, `@keyframes`, элементный селектор) → полный прогон;
 *   - `design/figma-specs.json` → истории, у которых изменились спеки; `qa/baseline/*.png` → истории этих эталонов;
 *   - файл вне `src/`, который импортирует история (`design/figma-flows.json`), — как модуль;
 *   - модуль, который импортирует только документация (.mdx), — не влияет; модуль в `src/` без импортёров → полный прогон (не знаем, кто его использует); `.mdx` и остальное вне `src/` — не влияет.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/** Пути, изменение которых меняет все истории сразу. */
const GLOBAL = [
  ['tokens/', 'токены'],
  ['src/tokens/', 'токены'],
  ['src/styles.css', 'глобальные стили'],
  ['.storybook/', 'конфиг Storybook'],
  ['scripts/qa/', 'скрипты QA'],
  ['scripts/tokens/', 'сборка токенов'],
  ['scripts/build-tokens.mjs', 'сборка токенов'],
  ['scripts/build-assets.mjs', 'сборка ресурсов'],
  ['scripts/postbuild.mjs', 'сборка Storybook'],
  ['package.json', 'зависимости'], // только при изменении зависимостей — см. цикл ниже
  ['package-lock.json', 'зависимости'],
];
const CODE = /\.(tsx?|jsx?|mjs)$/;
const VCS = 'git';

const vcs = (root, ...a) =>
  execFileSync(VCS, ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const globRe = (pattern) =>
  new RegExp(
    '^' +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*\//g, '(?:.*/)?')
        .replace(/\*/g, '[^/]*') +
      '$',
  );

/**
 * Обратный граф импортов по src/: файл (путь от корня) → кто его импортирует.
 * Именованный импорт из «бочки» (`index.tsx` с `export * from`) ведёт к модулю, который объявляет имя, а не ко всей бочке:
 * иначе правка одного модуля молекул задела бы всех, кто импортирует хоть что-то из `../molecules`.
 */
function importers(root) {
  const files = walk(join(root, 'src')).map((p) => relative(root, p));
  const rev = new Map();
  const edge = (from, to) => {
    if (!rev.has(to)) rev.set(to, new Set());
    rev.get(to).add(from);
  };
  const isFile = (c) => existsSync(join(root, c)) && statSync(join(root, c)).isFile();
  const resolveSpec = (from, spec) => {
    const base = relative(root, resolve(root, dirname(from), spec.replace(/\?.*$/, '')));
    return (
      [base, ...['.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx'].map((e) => base + e)].find(isFile) ?? null
    );
  };
  // .mdx — тоже импортёры: модуль, нужный только документации, историй не задевает
  const text = new Map(
    files.filter((f) => CODE.test(f) || f.endsWith('.mdx')).map((f) => [f, readFileSync(join(root, f), 'utf8')]),
  );
  const SPEC = '[\'"](\\.{1,2}(?:/[^\'"]*)?)[\'"]';
  const names = (list) =>
    list
      .replace(/[{}]/g, '')
      .split(',')
      .map(
        (n) =>
          n
            .trim()
            .replace(/^type\s+/, '')
            .split(/\s+as\s+/)[0],
      )
      .filter(Boolean);
  /** Что модуль объявляет сам и что реэкспортирует: { own: Set, re: [{ to, names: string[] | null }] } */
  const shape = new Map();
  const shapeOf = (f) => {
    if (shape.has(f)) return shape.get(f);
    const src = text.get(f) ?? '';
    const own = new Set();
    for (const [, n] of src.matchAll(
      /\bexport\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:const|let|var|function\*?|class|type|interface|enum)\s+([\w$]+)/g,
    ))
      own.add(n);
    for (const [, list] of src.matchAll(/\bexport\s+(?:type\s+)?(\{[^}]*\})\s*;/g))
      names(list).forEach((n) => own.add(n));
    const re = [];
    for (const [, what, spec] of src.matchAll(
      new RegExp('\\bexport\\s+(?:type\\s+)?(\\*(?:\\s+as\\s+[\\w$]+)?|\\{[^}]*\\})\\s*from\\s*' + SPEC, 'g'),
    )) {
      const to = resolveSpec(f, spec);
      if (to) re.push({ to, names: what.startsWith('*') ? (/\sas\s/.test(what) ? [] : null) : names(what) });
    }
    const res = { own, re };
    shape.set(f, res);
    return res;
  };
  /** Модули, откуда на самом деле приходит имя (через цепочку реэкспортов); пусто — не нашли. */
  const providers = (f, name, seen = new Set()) => {
    if (seen.has(f)) return [];
    seen.add(f);
    const { own, re } = shapeOf(f);
    if (own.has(name)) return [f];
    return re.filter((r) => r.names === null || r.names.includes(name)).flatMap((r) => providers(r.to, name, seen));
  };
  for (const [f, src] of text) {
    // import … from / export … from: именованные имена — к модулям-источникам, остальное — к файлу
    for (const [, kw, what, spec] of src.matchAll(
      new RegExp('\\b(import|export)\\s+(?:type\\s+)?([^;\'"]*?)\\s*from\\s*' + SPEC, 'g'),
    )) {
      const to = resolveSpec(f, spec);
      if (!to) continue;
      const named = what.match(/^(?:[\w$]+\s*,\s*)?(\{[^}]*\})$/);
      const via =
        named && !/^[\w$]+\s*,/.test(what) && shapeOf(to).re.length
          ? names(named[1]).map((n) => providers(to, n))
          : null;
      if (kw === 'import' && via && via.every((p) => p.length)) via.flat().forEach((p) => edge(f, p));
      else edge(f, to);
    }
    // import './x.css', import('./x')
    for (const [, spec] of src.matchAll(new RegExp('\\bimport\\s*\\(?\\s*' + SPEC, 'g'))) {
      const to = resolveSpec(f, spec);
      if (to) edge(f, to);
    }
    for (const [, arg] of src.matchAll(/import\.meta\.glob\s*(?:<[^(]*>)?\(\s*(\[[^\]]*\]|'[^']*'|"[^"]*")/g)) {
      const pats = [...arg.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
      const abs = (p) => relative(root, resolve(root, dirname(f), p));
      const yes = pats.filter((p) => !p.startsWith('!')).map((p) => globRe(abs(p)));
      const no = pats.filter((p) => p.startsWith('!')).map((p) => globRe(abs(p.slice(1))));
      for (const t of files) if (yes.some((r) => r.test(t)) && !no.some((r) => r.test(t))) edge(f, t);
    }
  }
  return { files, rev };
}

/** Строки нового и старого файла, затронутые diff (номера с 1). */
function hunks(root, base, file) {
  const out = { old: [], new: [] };
  let diff = '';
  try {
    diff = vcs(root, 'diff', '-U0', '--no-renames', base, '--', file);
  } catch {
    return out;
  }
  for (const [, o, on, n, nn] of diff.matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)) {
    const oc = on === undefined ? 1 : +on,
      nc = nn === undefined ? 1 : +nn;
    for (let i = 0; i < oc; i++) out.old.push(+o + i);
    for (let i = 0; i < nc; i++) out.new.push(+n + i);
  }
  return out;
}

/** Правила CSS с диапазонами строк: [{ prelude, from, to }] (комментарии и строки пропускаются). */
function cssRules(text) {
  const rules = [];
  const stack = [];
  let line = 1,
    prelude = '',
    preludeLine = 1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      const e = text.indexOf('*/', i + 2);
      const end = e < 0 ? text.length : e + 2;
      line += (text.slice(i, end).match(/\n/g) ?? []).length;
      i = end - 1;
      continue;
    }
    if (c === '"' || c === "'") {
      const e = text.indexOf(c, i + 1);
      prelude += text.slice(i, e + 1);
      i = e;
      continue;
    }
    if (c === '\n') line++;
    if (c === '{') {
      stack.push({ prelude: prelude.trim(), from: preludeLine });
      prelude = '';
      continue;
    }
    if (c === '}') {
      const r = stack.pop();
      if (r) rules.push({ ...r, to: line });
      prelude = '';
      continue;
    }
    if (c === ';') {
      prelude = '';
      continue;
    }
    if (!prelude.trim() && /\S/.test(c)) preludeLine = line;
    prelude += c;
  }
  return rules;
}

/** Блоки `y-*`, задетые правкой CSS, или причина полного прогона. */
function cssBlocks(text, lines, file) {
  const rules = cssRules(text);
  const src = text.split('\n');
  const blocks = new Set();
  const wrappers = /^@(media|supports|container|layer)\b/;
  for (const ln of lines) {
    const inner = rules.filter((r) => r.from <= ln && ln <= r.to).sort((a, b) => b.from - a.from || a.to - b.to)[0];
    const l = src[ln - 1] ?? '';
    if (!inner || wrappers.test(inner.prelude)) {
      if (!l.trim() || /^\s*(\/\*|\*|\})/.test(l)) continue; // пустая строка, комментарий, закрывающая скобка между правилами
      return { reason: `${file}:${ln} — правка вне правила с классом («${l.trim().slice(0, 40)}»)` };
    }
    const own = inner.prelude;
    if (own.startsWith('@')) return { reason: `${file}:${ln} — правка в ${own.slice(0, 40)}` };
    const names = [...own.matchAll(/\.(y-[\w-]+)/g)].map((m) => m[1].split(/__|--/)[0]);
    if (!names.length) return { reason: `${file}:${ln} — глобальный селектор «${own.slice(0, 40)}»` };
    names.forEach((n) => blocks.add(n));
  }
  return { blocks };
}

/**
 * @param {string} root корень репозитория
 * @param {{id:string, importPath:string}[]} stories истории из index.json
 * @param {string} ref с чем сравнивать (merge-base HEAD и ref); `--changed=<ref>` в run.mjs
 * @returns {{ full: string | null, ids: Set<string>, why: [string, string[]][], ignored: string[] }}
 *   full — причина полного прогона (тогда ids — все истории); why — файл → файлы историй, которые он задел
 */
export function changedStories(root, stories, ref = 'origin/main') {
  const full = (reason) => ({ full: reason, ids: new Set(stories.map((s) => s.id)), why: [], ignored: [] });
  let base;
  try {
    base = vcs(root, 'merge-base', 'HEAD', ref).trim();
  } catch {
    return full(`нет merge-base с ${ref} — сделайте fetch`);
  }
  const lines = (s) => s.split('\n').filter(Boolean);
  const changes = lines(vcs(root, 'diff', '--name-status', '--no-renames', base))
    .map((l) => l.split('\t'))
    .concat(lines(vcs(root, 'ls-files', '--others', '--exclude-standard')).map((f) => ['A', f]));

  const byFile = new Map();
  for (const s of stories) {
    const f = s.importPath.replace(/^\.\//, '');
    if (!byFile.has(f)) byFile.set(f, []);
    byFile.get(f).push(s.id);
  }
  const { files, rev } = importers(root);
  const closure = (start) => {
    const seen = new Set(start),
      queue = [...start];
    while (queue.length)
      for (const p of rev.get(queue.shift()) ?? [])
        if (!seen.has(p)) {
          seen.add(p);
          queue.push(p);
        }
    return [...seen].filter((f) => byFile.has(f));
  };
  const ids = new Set();
  const why = [];
  const ignored = [];
  const take = (file, storyFiles) => {
    storyFiles.forEach((f) => byFile.get(f).forEach((id) => ids.add(id)));
    why.push([file, storyFiles]);
  };

  for (const [status, file] of changes) {
    if (file === 'package.json') {
      // меняются только scripts и метаданные — истории те же; зависимости — полный прогон
      const deps = (json) =>
        JSON.stringify(['dependencies', 'devDependencies', 'overrides', 'type'].map((k) => JSON.parse(json)[k]));
      let before = '';
      try {
        before = deps(vcs(root, 'show', `${base}:${file}`));
      } catch {
        /* новый файл */
      }
      if (before === deps(readFileSync(join(root, file), 'utf8'))) {
        ignored.push(`${file} (без изменения зависимостей)`);
        continue;
      }
    }
    const g = GLOBAL.find(([p]) => file === p || (p.endsWith('/') && file.startsWith(p)));
    if (g) return full(`${file} — ${g[1]}`);
    if (status === 'D') {
      ignored.push(`${file} (удалён)`);
      continue;
    }
    const shot = file.match(/^qa\/baseline\/(.+)--(light|dark)\.png$/);
    if (shot) {
      if (stories.some((s) => s.id === shot[1])) {
        ids.add(shot[1]);
        why.push([file, [shot[1]]]);
      } else ignored.push(`${file} (истории нет)`);
      continue;
    }
    if (file === 'design/figma-specs.json') {
      const group = (json) => {
        const m = new Map();
        for (const s of JSON.parse(json).specs ?? []) m.set(s.story, [...(m.get(s.story) ?? []), JSON.stringify(s)]);
        return m;
      };
      let before;
      try {
        before = group(vcs(root, 'show', `${base}:${file}`));
      } catch {
        before = new Map();
      }
      const after = group(readFileSync(join(root, file), 'utf8'));
      const touched = [...new Set([...before.keys(), ...after.keys()])].filter(
        (k) => JSON.stringify(before.get(k)) !== JSON.stringify(after.get(k)) && stories.some((s) => s.id === k),
      );
      touched.forEach((id) => ids.add(id));
      why.push([`${file} (спеки)`, touched]);
      continue;
    }
    // файл в графе импортов (в том числе вне src/: design/figma-flows.json, src/docs/*.json) — истории над ним
    const storyFiles = file.endsWith('.css') ? [] : closure([file]);
    if (storyFiles.length) {
      take(file, storyFiles);
      continue;
    }
    if (!file.startsWith('src/') || file.endsWith('.mdx')) {
      ignored.push(file);
      continue;
    }
    if (file.endsWith('.css')) {
      const h = hunks(root, base, file);
      const now = cssBlocks(readFileSync(join(root, file), 'utf8'), h.new, file);
      if (now.reason) return full(now.reason);
      let old = '';
      try {
        old = vcs(root, 'show', `${base}:${file}`);
      } catch {
        /* новый файл */
      }
      const was = old ? cssBlocks(old, h.old, `${file} (было)`) : { blocks: new Set() };
      if (was.reason) return full(was.reason);
      const blocks = [...new Set([...now.blocks, ...was.blocks])];
      const users = blocks.length
        ? files.filter(
            (f) =>
              CODE.test(f) &&
              blocks.some((b) => new RegExp(`${b}(?=__|--|[^\\w-]|$)`, 'm').test(readFileSync(join(root, f), 'utf8'))),
          )
        : [];
      take(`${file} (${blocks.join(', ') || 'без классов'})`, closure([file, ...users]));
      continue;
    }
    if (/\.stories\.tsx?$/.test(file)) {
      ignored.push(`${file} (нет историй в index.json — пересоберите Storybook)`);
      continue;
    }
    if (rev.get(file)?.size) {
      ignored.push(`${file} (только документация)`);
      continue;
    }
    return full(`${file} — нет импортёров, не понять, какие истории задеты`);
  }
  return { full: null, ids, why, ignored };
}
