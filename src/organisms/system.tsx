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
        {/* iOS: сотовая 19.2 × 12, Wi‑Fi 17 × 12, батарея 27.3 × 13, зазор 7 */}
        <svg width="19.2" height="12" viewBox="0 0 19.2 12" fill="currentColor"><rect x="0" y="7.5" width="3.2" height="4.5" rx="1" /><rect x="5.33" y="5" width="3.2" height="7" rx="1" /><rect x="10.67" y="2.5" width="3.2" height="9.5" rx="1" /><rect x="16" y="0" width="3.2" height="12" rx="1" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1.6 4.6a9.8 9.8 0 0 1 13.8 0" /><path d="M4.1 7.1a6.3 6.3 0 0 1 8.8 0" /><path d="M8.5 11.6 6.7 9.7a2.6 2.6 0 0 1 3.6 0Z" fill="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
        <svg width="27.3" height="13" viewBox="0 0 27.3 13" fill="none"><rect x=".5" y=".5" width="24" height="12" rx="3.8" stroke="currentColor" opacity=".35" /><rect x="2" y="2" width="21" height="9" rx="2.5" fill="currentColor" /><path d="M26 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".4" /></svg>
      </span>
    </div>
  );
}
