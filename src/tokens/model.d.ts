// Типы для model.js: ключи групп берутся из tokens/tokens.json, поэтому новое имя токена сразу видно в типах.
import type source from '../../tokens/tokens.json';

type Keys<T> = Exclude<keyof T, `$${string}`> & string;
type Src = typeof source;

/** "#RRGGBB", "#RRGGBB@alpha", "transparent" или ссылка "{primitive.x}" / "{color.x}" / "{radius.x}". */
export type TokenValue = string;

export type SemanticColor = {
  light: TokenValue;
  dark: TokenValue;
  role: string;
  figma: string;
  /** Повышенный контраст (prefers-contrast: more / Increase Contrast): своё значение или значение темы. */
  contrast: { light: TokenValue; dark: TokenValue };
};
export type SemanticName = { [G in Keys<Src['color']>]: Keys<Src['color'][G]> }[Keys<Src['color']>];
export type ItemKey = Keys<Src['item']>;
export type HapticKey = Keys<Src['motion']['haptic']>;

/** ios / android нет у событий только для веба (`platforms: ["web"]`, #130). */
export type Haptic = { ios?: string; android?: string; androidMin?: number; androidFallback?: string; platforms: ('web' | 'ios' | 'android')[]; when: string; use: string };

export interface TokensModel {
  primitive: Record<Keys<Src['primitive']>, string>;
  item: Record<ItemKey, { value: TokenValue; name: string; on: string }>;
  avatar: { $description: string; palette: string[] };
  /** Семантические цвета по группам; ключ группы — её название («Поверхности», …). */
  color: Record<string, Record<string, SemanticColor>>;
  component: Record<Keys<Src['component']>, TokenValue>;
  space: number[];
  radius: Record<Keys<Src['radius']>, { value: number; use: string }>;
  font: Record<Keys<Src['font']>, { family: string; fallback: string; file: string; android: string; weights: number[]; source: string }>;
  typography: Record<Keys<Src['typography']>, { font: Keys<Src['font']>; weight: number; size: number; lineHeight: number; letterSpacing: number; use: string }>;
  shadow: Record<Keys<Src['shadow']>, { light: Shadow; dark: Shadow; use: string }>;
  layout: Record<Keys<Src['layout']>, number>;
  motion: {
    duration: Record<Keys<Src['motion']['duration']>, number>;
    easing: Record<Keys<Src['motion']['easing']>, [number, number, number, number]>;
    spring: Record<Keys<Src['motion']['spring']>, { mass: number; stiffness: number; damping: number; duration: number; figma: string }>;
    transition: Record<Keys<Src['motion']['transition']>, { duration?: string; easing?: string; spring?: string; use: string }>;
    haptic: Record<HapticKey, Haptic>;
    gesture: Record<Keys<Src['motion']['gesture']>, { value: number; unit: '' | 'ms' | 'px' | 'px/s'; use: string }>;
  };
}
type Shadow = { x: number; y: number; blur: number; color: string };

export declare function toModel(source: unknown): TokensModel;
export declare const tokens: TokensModel;
export default tokens;
