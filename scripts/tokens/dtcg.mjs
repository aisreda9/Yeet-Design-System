// DTCG (designtokens.org, формат 2025.10): чтение tokens/tokens.json, проверка схемы и ссылок, развёртка модификаторов.
// Используется сборкой (scripts/build-tokens.mjs) и адаптером src/tokens/model.js. Ошибка схемы = упавшая сборка = красный CI.
import { readFileSync } from 'node:fs';

export const EXT = 'com.yeet';
/** Типы спецификации DTCG. */
export const DTCG_TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography'];
/** Собственные типы проекта — описаны в корневом `$extensions["com.yeet"].customTypes`. */
export const CUSTOM_TYPES = ['spring', 'haptic'];
const TOKEN_PROPS = new Set(['$value', '$type', '$description', '$extensions', '$deprecated']);
const GROUP_PROPS = new Set(['$type', '$description', '$extensions', '$deprecated']);
const ROOT_PROPS = new Set([...GROUP_PROPS, '$schema']);
const REF = /^\{([^{}]+)\}$/;

export const readTokens = (root) => JSON.parse(readFileSync(new URL('tokens/tokens.json', root), 'utf8'));

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export const isRef = (v) => typeof v === 'string' && REF.test(v);
export const refPath = (v) => REF.exec(v)[1];
export const ext = (node) => (node?.$extensions ?? node?.extensions)?.[EXT] ?? {};

/** Все токены в порядке файла: [{ path: string[], id: 'a.b.c', type, value, description, extensions }]. */
export function flatten(tree) {
  const out = [];
  const walk = (node, path, type) => {
    const t = node.$type ?? type;
    if ('$value' in node) { out.push({ path, id: path.join('.'), type: t, value: node.$value, description: node.$description, extensions: node.$extensions, node }); return; }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$') && isObj(v)) walk(v, [...path, k], t);
  };
  walk(tree, [], undefined);
  return out;
}

/* ─── Проверка значения по типу ───────────────────────────────────────── */

const num = (v) => typeof v === 'number' && Number.isFinite(v);
const SUB = {
  typography: { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', letterSpacing: 'dimension', lineHeight: 'number' },
  shadow: { color: 'color', offsetX: 'dimension', offsetY: 'dimension', blur: 'dimension', spread: 'dimension' },
  transition: { duration: 'duration', delay: 'duration', timingFunction: 'cubicBezier' },
  border: { color: 'color', width: 'dimension', style: 'strokeStyle' },
  spring: { mass: 'number', stiffness: 'number', damping: 'number', duration: 'duration' },
};
const hex2 = (x) => Math.round(x * 255).toString(16).padStart(2, '0').toUpperCase();

/** Проверяет значение `v` типа `type`; ссылки собирает в `refs` как [путь, ожидаемый тип]. Возвращает список проблем. */
function checkValue(type, v, refs) {
  if (isRef(v)) { refs.push([refPath(v), type]); return []; }
  switch (type) {
    case 'color': {
      if (!isObj(v) || v.colorSpace !== 'srgb') return ['цвет — объект { colorSpace: "srgb", components, alpha?, hex? }'];
      if (!Array.isArray(v.components) || v.components.length !== 3 || !v.components.every((c) => num(c) && c >= 0 && c <= 1)) return ['components — три числа 0…1'];
      if ('alpha' in v && !(num(v.alpha) && v.alpha >= 0 && v.alpha <= 1)) return ['alpha — число 0…1'];
      if ('hex' in v) {
        if (!/^#[0-9A-F]{6}$/.test(v.hex)) return [`hex "${v.hex}" — #RRGGBB (верхний регистр)`];
        if (v.components.map(hex2).join('') !== v.hex.slice(1)) return [`hex ${v.hex} не совпадает с components [${v.components}]`];
      }
      return [];
    }
    case 'dimension': return isObj(v) && num(v.value) && ['px', 'rem'].includes(v.unit) ? [] : ['размер — { value: число, unit: "px" | "rem" }'];
    case 'duration': return isObj(v) && num(v.value) && v.value >= 0 && ['ms', 's'].includes(v.unit) ? [] : ['длительность — { value: число ≥ 0, unit: "ms" | "s" }'];
    case 'number': return num(v) ? [] : ['число'];
    case 'fontWeight': return (num(v) && v >= 1 && v <= 1000) || typeof v === 'string' ? [] : ['вес — число 1…1000'];
    case 'fontFamily': return typeof v === 'string' || (Array.isArray(v) && v.length && v.every((s) => typeof s === 'string')) ? [] : ['семейство — строка или массив строк'];
    case 'cubicBezier': return Array.isArray(v) && v.length === 4 && v.every(num) && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1 ? [] : ['кривая — [x1, y1, x2, y2], x в 0…1'];
    case 'strokeStyle': return typeof v === 'string' || isObj(v) ? [] : ['стиль линии'];
    case 'gradient': return Array.isArray(v) ? v.flatMap((s) => checkValue('color', s.color, refs)) : ['градиент — массив остановок'];
    case 'haptic': {
      if (!isObj(v)) return ['хаптика — объект { ios, android, androidMin?, androidFallback? }'];
      const p = [];
      if (!/^(selection|impact:(light|medium|heavy|soft|rigid)|notification:(success|warning|error))$/.test(v.ios)) p.push(`ios "${v.ios}" — selection | impact:<style> | notification:<type>`);
      if (!/^[A-Z_]+$/.test(v.android)) p.push(`android "${v.android}" — константа HapticFeedbackConstants`);
      if ('androidMin' in v !== 'androidFallback' in v) p.push('androidMin и androidFallback задаются вместе');
      for (const k of Object.keys(v)) if (!['ios', 'android', 'androidMin', 'androidFallback'].includes(k)) p.push(`лишнее поле ${k}`);
      return p;
    }
    default: {
      const sub = SUB[type];
      if (!sub) return [`неизвестный тип "${type}"`];
      if (!isObj(v)) return [`${type} — объект { ${Object.keys(sub).join(', ')} }`];
      const p = [];
      for (const [k, t] of Object.entries(sub)) {
        if (!(k in v)) { if (!(type === 'shadow' && k === 'spread')) p.push(`нет поля ${k}`); continue; }
        p.push(...checkValue(t, v[k], refs).map((e) => `${k}: ${e}`));
      }
      for (const k of Object.keys(v)) if (!(k in sub) && !(type === 'shadow' && k === 'inset')) p.push(`лишнее поле ${k}`);
      return p;
    }
  }
}

/** Проверка всего файла. Возвращает список ошибок (пустой — всё в порядке). */
export function validate(tree) {
  const errors = [];
  const err = (where, msg) => errors.push(`${where || '(корень)'}: ${msg}`);
  const known = new Set([...DTCG_TYPES, ...CUSTOM_TYPES]);

  // Структура: служебные ключи, имена, $type групп
  const walk = (node, path) => {
    const id = path.join('.');
    const isToken = '$value' in node;
    const allowed = isToken ? TOKEN_PROPS : path.length ? GROUP_PROPS : ROOT_PROPS;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) { if (!allowed.has(k)) err(id, `неизвестное поле ${k}`); continue; }
      if (isToken) { err(id, `токен не может содержать "${k}"`); continue; }
      if (/[.{}]/.test(k)) err(id, `имя "${k}" содержит . { }`);
      if (!isObj(v)) { err([...path, k].join('.'), 'ожидается токен ({ $value }) или группа'); continue; }
      walk(v, [...path, k]);
    }
    if ('$type' in node && !known.has(node.$type)) err(id, `неизвестный тип "${node.$type}"`);
    if ('$description' in node && typeof node.$description !== 'string') err(id, '$description — строка');
  };
  walk(tree, []);

  const tokens = flatten(tree);
  const byId = new Map(tokens.map((t) => [t.id, t]));
  const refs = [];
  for (const t of tokens) {
    if (!t.type) { err(t.id, 'нет $type (ни у токена, ни у группы)'); continue; }
    if (!known.has(t.type)) continue; // уже сообщено выше
    const own = [];
    for (const p of checkValue(t.type, t.value, own)) err(t.id, p);
    refs.push(...own.map(([to, type]) => ({ from: t.id, to, type })));
    for (const [mode, mv] of Object.entries(ext(t).modes ?? {})) {
      const mr = [];
      for (const p of checkValue(t.type, mv, mr)) err(t.id, `modes.${mode}: ${p}`);
      refs.push(...mr.map(([to, type]) => ({ from: `${t.id} (modes.${mode})`, to, type })));
    }
    // after: размер отсчитывается от другого размера (web — calc(after + $value))
    const after = ext(t).after;
    if (after !== undefined) {
      if (t.type !== 'dimension') err(t.id, 'after — только у dimension');
      else if (!isRef(after)) err(t.id, 'after — ссылка на dimension-токен');
      else refs.push({ from: `${t.id} (after)`, to: refPath(after), type: 'dimension' });
    }
  }
  // Ссылки: цель существует, это токен, тип совпадает
  for (const r of refs) {
    const target = byId.get(r.to);
    if (!target) { err(r.from, `битая ссылка {${r.to}}`); continue; }
    if (target.type !== r.type) err(r.from, `ссылка {${r.to}}: тип ${target.type}, ожидается ${r.type}`);
  }
  // Циклы (только ссылки целиком)
  for (const t of tokens) {
    const seen = new Set([t.id]);
    let cur = t;
    while (cur && isRef(cur.value)) {
      const next = refPath(cur.value);
      if (seen.has(next)) { err(t.id, `циклическая ссылка через {${next}}`); break; }
      seen.add(next); cur = byId.get(next);
    }
  }
  // Модификаторы: бренд переопределяет только существующие семантические цвета
  const mods = ext(tree).modifiers ?? {};
  const themes = mods.theme?.contexts ?? [];
  for (const t of tokens) for (const mode of Object.keys(ext(t).modes ?? {})) if (!themes.includes(mode)) err(t.id, `modes.${mode}: нет такой темы в modifiers.theme.contexts`);
  if (mods.brand) {
    const semantic = new Set(tokens.filter((t) => t.path[0] === 'color').map((t) => t.path.at(-1)));
    const group = tree[mods.brand.group] ?? {};
    for (const [id, b] of Object.entries(group)) {
      if (id.startsWith('$')) continue;
      if (!ext(b).brand?.name) err(`${mods.brand.group}.${id}`, 'нет $extensions["com.yeet"].brand.name');
      for (const k of Object.keys(b)) if (!k.startsWith('$') && !semantic.has(k)) err(`${mods.brand.group}.${id}.${k}`, `бренд переопределяет несуществующий семантический цвет ${k}`);
    }
  }
  return errors;
}

export function assertValid(tree) {
  const errors = validate(tree);
  if (errors.length) throw new Error(`tokens/tokens.json не прошёл проверку DTCG (${errors.length}):\n  ${errors.join('\n  ')}`);
}

/* ─── Разрешение ссылок (для адаптера и расчётов) ─────────────────────── */

/** Значение с разрешёнными ссылками (рекурсивно, внутри составных тоже). `mode` — тема: берутся её значения у ссылочных токенов. */
export function resolver(tree) {
  const byId = new Map(flatten(tree).map((t) => [t.id, t]));
  const resolve = (v, mode) => {
    if (isRef(v)) {
      const t = byId.get(refPath(v));
      if (!t) throw new Error(`битая ссылка ${v}`);
      return resolve(valueIn(t, mode), mode);
    }
    if (Array.isArray(v)) return v.map((x) => resolve(x, mode));
    if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x, mode)]));
    return v;
  };
  return { byId, resolve, get: (id) => byId.get(id) };
}
/** Значение токена в теме: `modes[mode]`, иначе `$value`. */
export const valueIn = (t, mode) => (mode && ext(t).modes?.[mode] !== undefined ? ext(t).modes[mode] : t.value);

/**
 * Модификаторы → обычные токены для Style Dictionary: у каждого токена с `modes.<тема>` появляется двойник
 * `mode.<тема>.<путь>` со значением этой темы. SD разрешает в нём ссылки и применяет те же трансформы.
 */
export function expandModes(tree) {
  const mode = {};
  for (const t of flatten(tree)) {
    for (const [m, v] of Object.entries(ext(t).modes ?? {})) {
      let g = (mode[m] ??= {});
      for (const k of t.path.slice(0, -1)) g = g[k] ??= {};
      g[t.path.at(-1)] = { $type: t.type, $value: v, ...(t.description ? { $description: t.description } : {}) };
    }
  }
  const { $extensions, $description, ...rest } = tree;
  void $extensions; void $description;
  if ('mode' in rest) throw new Error('Группа "mode" зарезервирована под развёртку тем');
  return { ...rest, mode };
}
