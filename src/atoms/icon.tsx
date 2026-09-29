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

/**
 * Словесный знак yeet. Цвет наследуется: на акцентном фоне (Splash) — `--color-text-on-accent`,
 * поверх фото — `--color-text-on-photo`, в подвале настроек — `--color-text-secondary`.
 */
export type LogoProps = Omit<ComponentPropsWithRef<'svg'>, 'children'> & { height?: number };

export function Logo({ height = 32, className, ...rest }: LogoProps) {
  return (
    <svg className={cx('y-logo', className)} height={height} viewBox="0 14 136 64" fill="currentColor" role="img" aria-label="yeet" {...rest}>
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
