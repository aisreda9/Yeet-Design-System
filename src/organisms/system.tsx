import type { ComponentPropsWithRef } from 'react';
import { cx } from '../utils/cx';


/* ─── StatusBar (system) ────────────────────────────────────────────── */

/**
 * Статус-бар iOS — только для макетов и Storybook (Figma: system / status-bar · Tone).
 * `tone`: `onAccent` — светлый текст на акцентном фоне (сплэш); `onPhoto` — белый поверх фото и камеры (Search / Photo / Crop).
 */
export type StatusBarProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Окраска относительно фона (Figma: status-bar · Tone). */
  tone?: 'default' | 'onAccent' | 'onPhoto';
  /** @deprecated Используйте `tone="onAccent"`. */
  onAccent?: boolean;
  /** @deprecated Используйте `tone="onPhoto"`. */
  onPhoto?: boolean;
};

export function StatusBar({ tone, onAccent, onPhoto, className, ...rest }: StatusBarProps) {
  const t = tone ?? (onAccent ? 'onAccent' : onPhoto ? 'onPhoto' : 'default');
  return (
    <div className={cx('y-status-bar', t === 'onAccent' && 'y-status-bar--on-accent', t === 'onPhoto' && 'y-status-bar--on-photo', className)} aria-hidden {...rest}>
      <span>9:41</span>
      <span className="y-status-bar__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.6c2.2 0 4.2.9 5.7 2.3l1.1-1.1A9.6 9.6 0 0 0 8 1C5.4 1 3 2 1.2 3.8l1.1 1.1A8 8 0 0 1 8 2.6Zm0 3.2c1.3 0 2.5.5 3.4 1.4l1.1-1.1A6.4 6.4 0 0 0 8 4.2 6.4 6.4 0 0 0 3.5 6.1l1.1 1.1c.9-.9 2.1-1.4 3.4-1.4Zm0 3.2c.5 0 .9.2 1.2.5L8 10.7 6.8 9.5c.3-.3.7-.5 1.2-.5Z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".35" /><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".4" /></svg>
      </span>
    </div>
  );
}
