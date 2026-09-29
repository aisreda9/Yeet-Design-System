import type { Decorator } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import demoAvatarUrl from './demo-avatar.svg';
import demoPhotoUrl from './demo-photo.svg';

/** Демо-фото для историй: снимок вещи (поиск по фото, превью в поле) и фото профиля (аватар). */
export const demoPhoto = demoPhotoUrl;
export const demoAvatar = demoAvatarUrl;

/** Карточка «В флоу»: где в приложении встречается вариант компонента. */
export function Usage({ screen, note, children, width }: { screen: string; note?: string; children: ReactNode; width?: number }) {
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10, width }}>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>{children}</div>
      <figcaption style={{ font: '400 12px/16px var(--font-text)', color: 'var(--color-text-secondary)' }}>
        <b style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{screen}</b>
        {note ? ` — ${note}` : ''}
      </figcaption>
    </figure>
  );
}

/**
 * Сетка карточек «В флоу». В истории — `min(1100px, 90vw)` (100 % там схлопнул бы сетку до контента),
 * в Docs холст задаёт `--usage-grid-width: 100%` (`.storybook/preview.css`), иначе сетка шире блока и режется.
 */
export function UsageGrid({ children, min = 220 }: { children: ReactNode; min?: number }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: '32px 28px', width: 'var(--usage-grid-width, min(1100px, 90vw))', maxWidth: 1100 }}>{children}</div>;
}

/** Таблица вариантов: строки × колонки. */
export function Matrix({ rows, cols, render }: { rows: string[]; cols: string[]; render: (row: string, col: string) => ReactNode }) {
  const cell: CSSProperties = { padding: 8, font: '400 12px/16px var(--font-text)', color: 'var(--color-text-secondary)', textAlign: 'left' };
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={cell}>Вариант</th>
          {cols.map((c) => (
            <th key={c} style={cell}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r}>
            <th style={cell}>{r}</th>
            {cols.map((c) => (
              <td key={c} style={{ padding: 8 }}>{render(r, c)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Узкая колонка ширины экрана (353 = 393 − 2×20). */
export function Column({ children, gap = 16 }: { children: ReactNode; gap?: number }) {
  return <div style={{ width: 353, display: 'flex', flexDirection: 'column', gap }}>{children}</div>;
}

export const Do = ({ children }: { children: ReactNode }) => <Rule ok>{children}</Rule>;
export const Dont = ({ children }: { children: ReactNode }) => <Rule>{children}</Rule>;

function Rule({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <div style={{ borderTop: `3px solid ${ok ? '#00D08B' : '#FF4230'}`, padding: '12px 0', font: '500 14px/20px var(--font-text)' }}>
      <div style={{ font: '400 12px/16px var(--font-text)', color: ok ? '#00A06A' : '#FF4230', marginBottom: 4 }}>{ok ? '✓ Так' : '✕ Не так'}</div>
      {children}
    </div>
  );
}

/** Декоратор: компонент во всю ширину колонки экрана (353) или экрана (393). */
/**
 * Обёртка файла историй, которую история с тегом `bare` пропускает.
 * `decorators: []` в истории обёртку файла НЕ отменяет (Storybook складывает декораторы), поэтому «В флоу» используют `tags: ['bare']`.
 */
export const unlessBare = (decorator: Decorator): Decorator => (Story, ctx) => (ctx.tags.includes('bare') ? <Story /> : decorator(Story, ctx));

export const withWidth = (width: number) => (Story: () => ReactNode) => <div style={{ width }}><Story /></div>;

/**
 * Декоратор: sheet / dialog на затемнении, как на экране. Ширина — из переключателя «Экран» (`--screen-width`, 320–430),
 * чтобы ошибки ширины были видны на уровне организма; в узком окне Docs не шире холста.
 */
export const onOverlay = (Story: () => ReactNode) => (
  <div style={{ width: 'var(--screen-width, 393px)', maxWidth: '100%', background: 'var(--color-bg-overlay)', padding: '40px 8px 8px', borderRadius: 56, overflow: 'hidden' }}><Story /></div>
);

/**
 * Слот-заглушка для историй Templates: пунктирная рамка с подписью зоны шаблона вместо реального контента.
 * `height` — высота блока, `square` — квадрат во всю ширину (фото деталей).
 */
export function Slot({ label, height = 56, square, style }: { label: string; height?: number; square?: boolean; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', width: '100%',
        ...(square ? { aspectRatio: '1 / 1' } : { minHeight: height }),
        border: '1.5px dashed var(--color-border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)',
        color: 'var(--color-text-secondary)', font: '500 13px/18px var(--font-text)', textAlign: 'center', padding: 8,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
