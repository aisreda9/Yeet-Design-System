// Генератор ресурсов Swift Package native/ios (вызывается из scripts/build-tokens.mjs → npm run tokens):
//  • src/icons/icons.ts   → Generated/YeetIcons.swift   (SVG-контуры → SwiftUI Path, параметры обводки из SVG)
//  • src/icons/brand.ts   → Generated/YeetIcons.swift   (звезда штампа, словесный знак)
//  • src/icons/weather    → Resources/Weather.xcassets  (SVG с сохранением вектора) + Generated/YeetWeather.swift
//  • tokens/fonts/*.ttf   → Resources/Fonts             (регистрируются при первом использовании)
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const PKG = 'native/ios/Sources/YeetDesignSystem/';

/* ─── SVG → Swift ─────────────────────────────────────────────────────── */

const n = (x) => String(+(+x).toFixed(3));
const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0 };

/** SVG path `d` → строки Swift вида `p.addLine(to: pt(x, y))`, со сдвигом (translate) `[dx, dy]`. */
function pathToSwift(d, [dx, dy] = [0, 0]) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const out = [];
  const P = (x, y) => `pt(${n(x + dx)}, ${n(y + dy)})`;
  let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0, lcx = 0, lcy = 0, lastCurve = '';
  const isCmd = (tk) => /^[a-zA-Z]$/.test(tk);
  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    else if (!cmd) throw new Error(`Path starts without a command: ${d.slice(0, 40)}`);
    const up = cmd.toUpperCase(), rel = cmd !== up;
    if (!(up in ARGS)) throw new Error(`Unsupported SVG path command "${cmd}" in ${d.slice(0, 40)}…`);
    const a = tokens.slice(i, i + ARGS[up]).map(Number);
    if (a.length < ARGS[up] || a.some(Number.isNaN)) throw new Error(`Bad arguments for "${cmd}" in ${d.slice(0, 40)}…`);
    i += ARGS[up];
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    switch (up) {
      case 'M':
        cx = a[0] + ox; cy = a[1] + oy; sx = cx; sy = cy;
        out.push(`p.move(to: ${P(cx, cy)})`);
        cmd = rel ? 'l' : 'L'; // повторные пары после M — это L
        break;
      case 'L': cx = a[0] + ox; cy = a[1] + oy; out.push(`p.addLine(to: ${P(cx, cy)})`); break;
      case 'H': cx = a[0] + ox; out.push(`p.addLine(to: ${P(cx, cy)})`); break;
      case 'V': cy = a[0] + oy; out.push(`p.addLine(to: ${P(cx, cy)})`); break;
      case 'C': {
        const [x1, y1, x2, y2, x, y] = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy, a[4] + ox, a[5] + oy];
        out.push(`p.addCurve(to: ${P(x, y)}, control1: ${P(x1, y1)}, control2: ${P(x2, y2)})`);
        lcx = x2; lcy = y2; cx = x; cy = y;
        break;
      }
      case 'S': {
        const [x1, y1] = lastCurve === 'C' ? [2 * cx - lcx, 2 * cy - lcy] : [cx, cy];
        const [x2, y2, x, y] = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy];
        out.push(`p.addCurve(to: ${P(x, y)}, control1: ${P(x1, y1)}, control2: ${P(x2, y2)})`);
        lcx = x2; lcy = y2; cx = x; cy = y;
        break;
      }
      case 'Q': {
        const [x1, y1, x, y] = [a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy];
        out.push(`p.addQuadCurve(to: ${P(x, y)}, control: ${P(x1, y1)})`);
        lcx = x1; lcy = y1; cx = x; cy = y;
        break;
      }
      case 'T': {
        const [x1, y1] = lastCurve === 'Q' ? [2 * cx - lcx, 2 * cy - lcy] : [cx, cy];
        const [x, y] = [a[0] + ox, a[1] + oy];
        out.push(`p.addQuadCurve(to: ${P(x, y)}, control: ${P(x1, y1)})`);
        lcx = x1; lcy = y1; cx = x; cy = y;
        break;
      }
      case 'Z': out.push('p.closeSubpath()'); cx = sx; cy = sy; break;
    }
    lastCurve = up === 'C' || up === 'S' ? 'C' : up === 'Q' || up === 'T' ? 'Q' : '';
  }
  return out;
}

const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

/** Разметка иконки (path / circle / g translate) → слои { lines, stroke, fill, cap, join, dash }. */
function svgToLayers(markup, name) {
  const layers = [];
  const stack = [[0, 0]];
  for (const m of markup.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    const [, close, tag, rest, selfClose] = m;
    if (tag === 'g') {
      if (close) { stack.pop(); continue; }
      const a = attrs(rest);
      const [tx, ty] = stack.at(-1);
      let off = [tx, ty];
      if (a.transform) {
        const tr = /^translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)$/.exec(a.transform.trim());
        if (!tr) throw new Error(`Icon "${name}": only translate() transforms are supported, got "${a.transform}"`);
        off = [tx + Number(tr[1]), ty + Number(tr[2])];
      }
      if (!selfClose) stack.push(off);
      continue;
    }
    if (close) continue;
    const a = attrs(rest);
    const off = stack.at(-1);
    let lines;
    if (tag === 'path') lines = pathToSwift(a.d, off);
    else if (tag === 'circle') {
      const [cx, cy, r] = [Number(a.cx) + off[0], Number(a.cy) + off[1], Number(a.r)];
      lines = [`p.addEllipse(in: CGRect(x: ${n(cx - r)}, y: ${n(cy - r)}, width: ${n(2 * r)}, height: ${n(2 * r)}))`];
    } else throw new Error(`Icon "${name}": unsupported element <${tag}>`);
    layers.push({
      lines,
      stroke: a.stroke !== 'none',
      fill: a.fill !== undefined && a.fill !== 'none',
      cap: a['stroke-linecap'] ?? 'butt',
      join: a['stroke-linejoin'] ?? 'miter',
      dash: a['stroke-dasharray'] ? a['stroke-dasharray'].split(/[\s,]+/).map(Number) : [],
    });
  }
  return layers;
}

const pathBlock = (lines, indent) => [`Path { p in`, ...lines.map((l) => `${indent}    ${l}`), `${indent}}`].join('\n');

/* ─── Чтение исходников web ───────────────────────────────────────────── */

function readIcons(root) {
  const src = readFileSync(new URL('src/icons/icons.ts', root), 'utf8');
  const icons = [...src.matchAll(/^\s*'([\w-]+)':\s*("(?:[^"\\]|\\.)*"),?\s*$/gm)].map((m) => [m[1], JSON.parse(m[2])]);
  const declared = (src.match(/^\s*'[\w-]+':/gm) ?? []).length;
  if (icons.length !== declared) throw new Error(`icons.ts: parsed ${icons.length} of ${declared} icons — check the entry format`);
  return icons;
}

function readBrand(root) {
  const src = readFileSync(new URL('src/icons/brand.ts', root), 'utf8');
  const star = /export const stampStar =\s*'([^']*)'/.exec(src)?.[1];
  const logoBlock = /export const logoPaths = \[([\s\S]*?)\];/.exec(src)?.[1];
  if (!star || !logoBlock) throw new Error('brand.ts: stampStar / logoPaths not found');
  return { star, logo: [...logoBlock.matchAll(/'([^']*)'/g)].map((m) => m[1]) };
}

function readWeather(root) {
  const src = readFileSync(new URL('src/atoms/icon.tsx', root), 'utf8');
  const kinds = JSON.parse(/weatherKinds = (\[[^\]]*\])/.exec(src)[1].replace(/'/g, '"'));
  const block = /weatherNames[^=]*=\s*\{([\s\S]*?)\};/.exec(src)[1];
  const names = Object.fromEntries([...block.matchAll(/'?([\w-]+)'?:\s*'([^']*)'/g)].map((m) => [m[1], m[2]]));
  for (const k of kinds) if (!names[k]) throw new Error(`icon.tsx: no weatherNames entry for ${k}`);
  return kinds.map((k) => ({ kind: k, title: names[k] }));
}

/* ─── Запись ──────────────────────────────────────────────────────────── */

export function buildIosPackage(root, { header, swiftKeywords }) {
  const ident = (k) => { const c = camel(k); return swiftKeywords.has(c) ? `\`${c}\`` : c; };
  const write = (path, body) => {
    const url = new URL(PKG + path, root);
    mkdirSync(new URL('.', url), { recursive: true });
    writeFileSync(url, body);
    console.log(`✓ ${PKG}${path}`);
  };

  /* Иконки */
  const icons = readIcons(root);
  const brand = readBrand(root);
  const I = '    ';
  const L = [`// ${header}`, '// Иконки ui-icons (src/icons/icons.ts) и фирменная графика (src/icons/brand.ts), переведённые в SwiftUI Path.', '', 'import SwiftUI', ''];
  L.push('/// Слой иконки в координатах viewBox 24×24: контур и параметры обводки из SVG.', 'public struct YeetIconLayer {', `${I}public let path: Path`, `${I}public let stroke: Bool`, `${I}public let fill: Bool`, `${I}public let lineCap: CGLineCap`, `${I}public let lineJoin: CGLineJoin`, `${I}public let dash: [CGFloat]`, '}', '');
  L.push('/// Линейные иконки 24×24 из Figma (Design System 2.0 · ui-icons). Имя = имя в Figma и в React (`IconName`).', 'public enum YeetIconName: String, CaseIterable, Identifiable {');
  for (const [k] of icons) L.push(`${I}case ${ident(k)} = "${k}"`);
  L.push('', `${I}public var id: String { rawValue }`, `${I}/// Слои контура (viewBox 24×24).`, `${I}public var layers: [YeetIconLayer] { YeetIconPaths.layers(for: self) }`, '}', '');
  L.push('private func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x, y: y) }', '');
  L.push('enum YeetIconPaths {', `${I}static func layers(for name: YeetIconName) -> [YeetIconLayer] {`, `${I}${I}switch name {`);
  for (const [k] of icons) L.push(`${I}${I}case .${ident(k)}: return ${ident(k)}`);
  L.push(`${I}${I}}`, `${I}}`);
  for (const [k, markup] of icons) {
    L.push('', `${I}private static let ${ident(k)}: [YeetIconLayer] = [`);
    for (const layer of svgToLayers(markup, k))
      L.push(`${I}${I}YeetIconLayer(path: ${pathBlock(layer.lines, I + I)}, stroke: ${layer.stroke}, fill: ${layer.fill}, lineCap: .${layer.cap}, lineJoin: .${layer.join}, dash: [${layer.dash.map(n).join(', ')}]),`);
    L.push(`${I}]`);
  }
  L.push('}', '');
  L.push('/// Фирменная графика: звезда штампа (`shapes / main-action`) и словесный знак `yeet`.', 'public enum YeetBrandPath {', `${I}/// viewBox звезды штампа.`, `${I}public static let stampStarViewBox = CGSize(width: 144, height: 144)`);
  L.push(`${I}public static let stampStar: Path = ${pathBlock(pathToSwift(brand.star), I)}`);
  L.push(`${I}/// viewBox словесного знака (в web — "0 14 136 64", здесь сдвинут к нулю).`, `${I}public static let logoViewBox = CGSize(width: 136, height: 64)`);
  L.push(`${I}public static let logo: Path = ${pathBlock(brand.logo.flatMap((d) => pathToSwift(d, [0, -14])), I)}`, '}');
  write('Generated/YeetIcons.swift', L.join('\n') + '\n');

  /* Погода: SVG в asset-каталог (вектор сохраняется) */
  const weather = readWeather(root);
  const cat = new URL(PKG + 'Resources/Weather.xcassets/', root);
  rmSync(cat, { recursive: true, force: true });
  mkdirSync(cat, { recursive: true });
  const info = { author: 'xcode', version: 1 };
  writeFileSync(new URL('Contents.json', cat), JSON.stringify({ info }, null, 2) + '\n');
  for (const { kind } of weather) {
    const set = new URL(`weather-${kind}.imageset/`, cat);
    mkdirSync(set, { recursive: true });
    copyFileSync(new URL(`src/icons/weather/${kind}.svg`, root), new URL(`${kind}.svg`, set));
    writeFileSync(new URL('Contents.json', set), JSON.stringify({ images: [{ filename: `${kind}.svg`, idiom: 'universal' }], info, properties: { 'preserves-vector-representation': true } }, null, 2) + '\n');
  }
  console.log(`✓ ${PKG}Resources/Weather.xcassets (${weather.length})`);
  const W = [`// ${header}`, '// Цветные иконки погоды из Figma (Design System → weather-icons), src/icons/weather → Resources/Weather.xcassets.', '', 'import SwiftUI', ''];
  W.push('public enum YeetWeather: String, CaseIterable, Identifiable {');
  for (const { kind } of weather) W.push(`${I}case ${ident(kind)} = "${kind}"`);
  W.push('', `${I}public var id: String { rawValue }`, '', `${I}/// Описание для VoiceOver.`, `${I}public var title: String {`, `${I}${I}switch self {`);
  for (const { kind, title } of weather) W.push(`${I}${I}case .${ident(kind)}: return "${title}"`);
  W.push(`${I}${I}}`, `${I}}`, '', `${I}public var image: Image { Image("weather-\\(rawValue)", bundle: .module) }`, '}');
  write('Generated/YeetWeather.swift', W.join('\n') + '\n');

  /* Шрифты */
  const fonts = new URL(PKG + 'Resources/Fonts/', root);
  mkdirSync(fonts, { recursive: true });
  for (const f of readdirSync(new URL('tokens/fonts/', root)).filter((f) => /\.(ttf|txt)$/.test(f)))
    copyFileSync(new URL(`tokens/fonts/${f}`, root), new URL(f, fonts));
  console.log(`✓ ${PKG}Resources/Fonts`);
}
