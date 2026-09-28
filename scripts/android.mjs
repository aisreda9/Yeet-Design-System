// Android-часть генератора (вызывается из scripts/build-tokens.mjs → npm run tokens):
// src/icons/icons.ts + src/icons/brand.ts → YeetIcons.kt (данные для ImageVector), tokens/fonts → res/font.
// Сгенерированные файлы не правятся руками.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';

export const ANDROID_MODULE = 'native/android/yeet-design-system/src/main';

const HEADER = 'Сгенерировано scripts/android.mjs (npm run tokens) из src/icons/icons.ts и src/icons/brand.ts — не редактировать вручную.';

const pascal = (s) => s.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const f = (x) => {
  const n = +(+x).toFixed(3);
  return `${Number.isInteger(n) ? n : n}f`;
};

/** Словарь `'name': "<svg-fragment>"` из icons.ts (строки — JSON-совместимые литералы в двойных кавычках). */
function readIcons(root) {
  const src = readFileSync(new URL('src/icons/icons.ts', root), 'utf8');
  const out = [];
  let comment = null;
  for (const line of src.split('\n')) {
    const c = /^\s*\/\/\s*(.+)$/.exec(line);
    if (c) { comment = c[1]; continue; }
    const m = /^\s*'([\w-]+)':\s*("(?:[^"\\]|\\.)*"),?\s*$/.exec(line);
    if (m) { out.push({ name: m[1], svg: JSON.parse(m[2]), comment }); comment = null; }
  }
  if (out.length < 10) throw new Error('icons.ts: не удалось разобрать иконки');
  return out;
}

function readBrand(root) {
  const src = readFileSync(new URL('src/icons/brand.ts', root), 'utf8');
  const logoBlock = /logoPaths\s*=\s*\[([\s\S]*?)\];/.exec(src)?.[1] ?? '';
  const logo = [...logoBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const star = /stampStar\s*=\s*'([^']+)'/.exec(src)?.[1];
  const viewBox = /viewBox "([\d.\s-]+)"/.exec(src)?.[1]?.split(/\s+/).map(Number) ?? [0, 14, 136, 64];
  if (!logo.length || !star) throw new Error('brand.ts: не удалось разобрать logoPaths / stampStar');
  return { logo, star, viewBox };
}

const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

/** Окружность → путь из двух дуг. */
const circlePath = ({ cx, cy, r }) => {
  const [x, y, R] = [+cx, +cy, +r];
  return `M${x - R} ${y}A${R} ${R} 0 1 0 ${x + R} ${y}A${R} ${R} 0 1 0 ${x - R} ${y}Z`;
};

/**
 * ImageVector не умеет stroke-dasharray — пунктир раскладывается на отрезки при генерации.
 * Поддерживаются только абсолютные M / L / H / V / Z (этого хватает для рамки `collage`).
 */
function dashPath(d, pattern) {
  const [on, off] = pattern.split(/[\s,]+/).map(Number);
  const tokens = d.match(/[MLHVZ]|-?\d*\.?\d+/gi);
  const polylines = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, cmd = null;
  for (let i = 0; i < tokens.length;) {
    if (/^[A-Za-z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (!/[MLHVZ]/.test(cmd)) throw new Error(`dash: команда ${cmd} не поддерживается`);
      if (cmd === 'Z') { cur.push([sx, sy]); x = sx; y = sy; continue; }
    }
    if (cmd === 'M') { x = +tokens[i++]; y = +tokens[i++]; sx = x; sy = y; cur = [[x, y]]; polylines.push(cur); cmd = 'L'; }
    else if (cmd === 'L') { x = +tokens[i++]; y = +tokens[i++]; cur.push([x, y]); }
    else if (cmd === 'H') { x = +tokens[i++]; cur.push([x, y]); }
    else if (cmd === 'V') { y = +tokens[i++]; cur.push([x, y]); }
    else throw new Error(`dash: неожиданный токен ${tokens[i]}`);
  }
  const segs = [];
  for (const pl of polylines) {
    let drawing = true, left = on;
    for (let k = 1; k < pl.length; k++) {
      let [x0, y0] = pl[k - 1];
      const [x1, y1] = pl[k];
      let len = Math.hypot(x1 - x0, y1 - y0);
      const ux = (x1 - x0) / (len || 1), uy = (y1 - y0) / (len || 1);
      while (len > 1e-6) {
        const step = Math.min(left, len);
        const nx = x0 + ux * step, ny = y0 + uy * step;
        if (drawing) segs.push(`M${+x0.toFixed(3)} ${+y0.toFixed(3)}L${+nx.toFixed(3)} ${+ny.toFixed(3)}`);
        x0 = nx; y0 = ny; len -= step; left -= step;
        if (left <= 1e-6) { drawing = !drawing; left = drawing ? on : off; }
      }
    }
  }
  return segs.join('');
}

/** SVG-фрагмент иконки → список путей с атрибутами обводки. */
function parseFragment(name, svg) {
  const paths = [];
  const stack = [[0, 0]];
  for (const m of svg.matchAll(/<(\/?)(g|path|circle)\b([^>]*?)\/?>/g)) {
    const [, close, tag, rest] = m;
    if (tag === 'g') {
      if (close) { stack.pop(); continue; }
      const a = attrs(rest);
      const tr = a.transform ? /^translate\(([-\d.]+)[\s,]+([-\d.]+)\)$/.exec(a.transform) : ['', '0', '0'];
      if (!tr) throw new Error(`${name}: transform «${a.transform}» не поддерживается`);
      const [px, py] = stack.at(-1);
      stack.push([px + +tr[1], py + +tr[2]]);
      continue;
    }
    const a = attrs(rest);
    let d = tag === 'circle' ? circlePath(a) : a.d;
    if (a['stroke-dasharray']) d = dashPath(d, a['stroke-dasharray']);
    const [tx, ty] = stack.at(-1);
    paths.push({
      d,
      cap: { round: 'Round', square: 'Square' }[a['stroke-linecap']] ?? 'Butt',
      join: { round: 'Round', bevel: 'Bevel' }[a['stroke-linejoin']] ?? 'Miter',
      filled: a.fill !== undefined && a.fill !== 'none',
      stroked: a.stroke !== 'none',
      tx, ty,
    });
  }
  return paths;
}

function iconsKotlin(root) {
  const icons = readIcons(root);
  const brand = readBrand(root);
  const L = [`// ${HEADER}`, '// Линейные иконки ui-icons (Figma Design System 2.0): 24×24, обводка 1.3, цвет — tint (currentColor).', '', 'package design.yeet.ds.icons', '',
    'import androidx.compose.ui.graphics.StrokeCap', 'import androidx.compose.ui.graphics.StrokeJoin', ''];
  L.push('/** Имя иконки = имя в Figma и в React (`<Icon name="chevron-up-down" />`) → `IconName.ChevronUpDown`. */', 'enum class IconName(val key: String) {');
  for (const i of icons) {
    if (i.comment) L.push(`    /** ${i.comment} */`);
    L.push(`    ${pascal(i.name)}("${i.name}"),`);
  }
  L.push('    ;', '', '    companion object {', '        /** По имени из Figma / React: "chevron-up-down". */', '        fun fromKey(key: String): IconName? = entries.firstOrNull { it.key == key }', '    }', '}', '');
  L.push('internal class IconPath(', '    val d: String,', '    val cap: StrokeCap = StrokeCap.Butt,', '    val join: StrokeJoin = StrokeJoin.Miter,', '    val filled: Boolean = false,', '    val stroked: Boolean = true,', '    val translateX: Float = 0f,', '    val translateY: Float = 0f,', ')', '');
  L.push('internal fun iconPaths(name: IconName): Array<IconPath> = when (name) {');
  for (const i of icons) {
    const ps = parseFragment(i.name, i.svg).map((p) => {
      const args = [JSON.stringify(p.d)];
      if (p.cap !== 'Butt') args.push(`cap = StrokeCap.${p.cap}`);
      if (p.join !== 'Miter') args.push(`join = StrokeJoin.${p.join}`);
      if (p.filled) args.push('filled = true');
      if (!p.stroked) args.push('stroked = false');
      if (p.tx) args.push(`translateX = ${f(p.tx)}`);
      if (p.ty) args.push(`translateY = ${f(p.ty)}`);
      return `IconPath(${args.join(', ')})`;
    });
    L.push(`    IconName.${pascal(i.name)} -> arrayOf(${ps.join(', ')})`);
  }
  L.push('}', '');
  const [vx, vy, vw, vh] = brand.viewBox;
  L.push('/** Фирменная графика (src/icons/brand.ts): словесный знак и 12-лучевая звезда штампа. */', 'internal object YeetBrandPaths {', `    /** Словесный знак yeet, viewBox "${vx} ${vy} ${vw} ${vh}". */`, '    val logo = listOf(');
  for (const p of brand.logo) L.push(`        ${JSON.stringify(p)},`);
  L.push('    )', `    const val logoViewportX = ${f(vx)}`, `    const val logoViewportY = ${f(vy)}`, `    const val logoViewportWidth = ${f(vw)}`, `    const val logoViewportHeight = ${f(vh)}`, '', '    /** Скруглённая звезда штампа, viewBox "0 0 144 144". */', `    const val stampStar = ${JSON.stringify(brand.star)}`, '    const val stampViewport = 144f', '}');
  return L.join('\n') + '\n';
}

/** Файлы Android-модуля: путь относительно корня репозитория → содержимое. */
export function androidOutputs(root) {
  return { [`${ANDROID_MODULE}/java/design/yeet/ds/icons/YeetIcons.kt`]: iconsKotlin(root) };
}

/** Шрифты tokens/fonts → res/font (имена ресурсов — font.*.android из tokens.json). */
export function copyAndroidFonts(root, fonts) {
  const dir = new URL(`${ANDROID_MODULE}/res/font/`, root);
  mkdirSync(dir, { recursive: true });
  for (const font of Object.values(fonts)) {
    copyFileSync(new URL(`tokens/fonts/${font.file}`, root), new URL(`${font.android}.ttf`, dir));
    console.log(`✓ ${ANDROID_MODULE}/res/font/${font.android}.ttf`);
  }
}
