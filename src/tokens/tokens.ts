/** Метаданные токенов для документации. Значения — из tokens/tokens.json (единый источник для web, iOS, Android). */
import tokens from '../../tokens/tokens.json';

export type ItemColor = keyof typeof tokens.item;

export type SemanticToken = { token: string; role: string; light: string; dark: string; figma: string };

const colorMap: Record<string, { light: string; dark: string }> = Object.assign({}, ...Object.values(tokens.color));

/** "{primitive.x}" / "{color.x}" / "#RRGGBB@a" → читаемое значение для таблиц. */
function show(ref: string, theme: 'light' | 'dark'): string {
  const m = /^\{(\w+)\.([\w-]+)\}$/.exec(ref);
  if (m?.[1] === 'primitive') return (tokens.primitive as Record<string, string>)[m[2]];
  if (m?.[1] === 'color') return show(colorMap[m[2]][theme], theme);
  const [hex, a] = ref.split('@');
  return a ? `${hex} @${Math.round(Number(a) * 100)}%` : hex;
}

export const semanticColors: { group: string; tokens: SemanticToken[] }[] = Object.entries(tokens.color).map(([group, entries]) => ({
  group,
  tokens: Object.entries(entries).map(([k, v]) => ({ token: `--color-${k}`, role: v.role, light: show(v.light, 'light'), dark: show(v.dark, 'dark'), figma: v.figma })),
}));

export const itemColors = Object.entries(tokens.item).map(([id, v]) => [id as ItemColor, v.name, show(v.value, 'light')] as const);

export const spaces = tokens.space;

export const radii = Object.entries(tokens.radius).map(([k, v]) => [`--radius-${k}`, v.value, v.use] as const);

const fontName = { display: 'Roboto Slab', text: 'Inter' } as const;
export const textStyles = Object.entries(tokens.typography).map(([k, s]) => [
  `y-${k}`,
  k.length === 2 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1),
  `${fontName[s.font as keyof typeof fontName]} ${s.weight} · ${s.size}/${s.lineHeight}${s.letterSpacing ? ` · ${s.letterSpacing}` : ''}`,
  s.use,
] as const);

/** Цвета аккаунтов (tokens.avatar.palette): фон аватара, буква — `--yeet-on-item-*`, контраст ≥ 4.5 : 1. */
export const avatarPalette = tokens.avatar.palette as ItemColor[];

/** Стабильный цвет аккаунта по id: один и тот же id — всегда один цвет. */
export function avatarColor(id: string): ItemColor {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return avatarPalette[h % avatarPalette.length];
}
