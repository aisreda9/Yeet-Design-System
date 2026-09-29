import type { ComponentPropsWithRef } from 'react';
import { logoPaths } from '../icons/brand';
import { icons, type IconName } from '../icons/icons';
import { cx } from '../utils/cx';

/* ─── Icon ──────────────────────────────────────────────────────────── */

export type IconProps = Omit<ComponentPropsWithRef<'svg'>, 'children' | 'name'> & {
  name: IconName;
  /** Сторона в px (графический примитив: число, а не шкала S–XL). */
  size?: number;
  /** Имя для скринридера. Без него иконка декоративная (`aria-hidden`). */
  title?: string;
  strokeWidth?: number;
};

/** Линейная иконка 24×24 из набора ui-icons. Цвет наследуется (`currentColor`). */
export function Icon({ name, size = 24, className, title, strokeWidth = 1.3, ...rest }: IconProps) {
  return (
    <svg
      className={cx('y-icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}

/* ─── Logo ──────────────────────────────────────────────────────────── */

/** Рамка и viewBox логотипа по Figma `yeet` 1180:20027: L — 136×88 (знак 130×60), S — 61×40 (знак 58×26.8). */
const logoFrame = { L: { width: 136, height: 88 }, S: { width: 61, height: 40 } } as const;

/**
 * Словесный знак yeet. Цвет наследуется (`currentColor`), отдельного `tone` нет — тоны Figma задаёт родитель:
 * Default — `--color-text-primary`, On Dark — `--color-text-on-accent` / `--color-text-on-photo`, Muted — `--color-text-secondary`.
 */
export type LogoProps = Omit<ComponentPropsWithRef<'svg'>, 'children'> & {
  /** Размер по Figma: L — рамка 136×88, S — рамка 61×40 (знак вписан с полями, как в макете). */
  size?: 'L' | 'S';
  /**
   * Высота знака без полей, px (по умолчанию 32).
   * @deprecated Для новых мест бери `size`. Проп оставлен для экранов, где высота не совпадает с L / S; при `size` игнорируется.
   */
  height?: number;
};

export function Logo({ size, height = 32, className, style, ...rest }: LogoProps) {
  // `.y-logo` ставит `width: auto` — рамку L / S задаём инлайном, чтобы ширина была ровно по Figma.
  const box = size ? { viewBox: '0 0 136 88', style: { ...logoFrame[size], ...style } } : { viewBox: '0 14 136 64', height, style };
  return (
    <svg className={cx('y-logo', className)} {...box} fill="currentColor" role="img" aria-label="yeet" {...rest}>
      {logoPaths.map((d) => <path key={d.slice(0, 12)} d={d} />)}
    </svg>
  );
}

/* ─── WeatherIcon ───────────────────────────────────────────────────── */

const weatherFiles = import.meta.glob<string>('../icons/weather/*.svg', { eager: true, query: '?url', import: 'default' });

/** Цветные иконки погоды из Figma (Design System → weather-icons): день / ночь для ясно и переменной облачности. */
export const weatherKinds = ['sunny', 'clear-day', 'clear-night', 'pcloudy-day', 'pcloudy-night', 'mcloudy', 'fog', 'rain', 'shower', 'tstorm', 'snow', 'windy'] as const;
export type Weather = (typeof weatherKinds)[number];
export const weatherNames: Record<Weather, string> = {
  sunny: 'Солнечно, облачка (главная)',
  'clear-day': 'Ясно', 'clear-night': 'Ясно, ночь', 'pcloudy-day': 'Переменная облачность', 'pcloudy-night': 'Переменная облачность, ночь',
  mcloudy: 'Облачно', fog: 'Туман', rain: 'Дождь', shower: 'Ливень', tstorm: 'Гроза', snow: 'Снег', windy: 'Ветрено',
};

export type WeatherIconProps = Omit<ComponentPropsWithRef<'img'>, 'src'> & { kind: Weather; /** Сторона в px. */ size?: number };

export function WeatherIcon({ kind, size = 24, className, ...rest }: WeatherIconProps) {
  return <img className={cx('y-weather-icon', className)} src={weatherFiles[`../icons/weather/${kind}.svg`]} width={size} height={size} alt={weatherNames[kind]} {...rest} />;
}

/* ─── Flag ──────────────────────────────────────────────────────────── */

const flagFiles = import.meta.glob<string>('../icons/flags/*.svg', { eager: true, query: '?url', import: 'default' });

/** Языки интерфейса и флаги из Figma (Design System → flags-icons), круглые 24. */
export const languages = [
  { code: 'ru', flag: 'ru', name: 'Русский' },
  { code: 'en', flag: 'gb', name: 'English' },
  { code: 'ka', flag: 'ge', name: 'ქართული' },
  { code: 'uk', flag: 'ua', name: 'Українська' },
  { code: 'kk', flag: 'kz', name: 'Қазақша' },
  { code: 'hy', flag: 'am', name: 'Հայերեն' },
  { code: 'de', flag: 'de', name: 'Deutsch' },
  { code: 'fr', flag: 'fr', name: 'Français' },
  { code: 'it', flag: 'it', name: 'Italiano' },
  { code: 'tr', flag: 'tr', name: 'Türkçe' },
  { code: 'ja', flag: 'jp', name: '日本語' },
  { code: 'zh', flag: 'cn', name: '中文' },
] as const;
export type FlagCode = 'ru' | 'by' | 'gb' | 'us' | 'ge' | 'ua' | 'kz' | 'am' | 'de' | 'fr' | 'it' | 'tr' | 'jp' | 'cn';

export type FlagProps = Omit<ComponentPropsWithRef<'img'>, 'src'> & { code: FlagCode; /** Сторона в px. */ size?: number };

/** Флаг декоративный: название языка или страны всегда написано рядом. */
export function Flag({ code, size = 24, className, ...rest }: FlagProps) {
  return <img className={cx('y-flag', className)} src={flagFiles[`../icons/flags/${code}.svg`]} width={size} height={size} alt="" aria-hidden {...rest} />;
}
