import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../atoms';
import { icons, type IconName } from '../icons/icons';
import { itemColors, radii, semanticColors, spaces, textStyles } from '../tokens/tokens';
import tokenSource from '../../tokens/tokens.json';
import { registry, type Level } from './registry';
import { motions } from '../motion/motion';
import '../tokens/tokens.css';

const mono: CSSProperties = { font: '400 12px/16px ui-monospace, SFMono-Regular, Menlo, monospace' };
const cap: CSSProperties = { font: '400 12px/16px var(--font-text)', color: '#6E6E6E' };

/** Таблица документации: заголовки + строки ячеек. Единый стиль для реестров и спецификаций. */
function DocTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  const th: CSSProperties = { ...cap, textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,.1)' };
  const td: CSSProperties = { padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,.06)', verticalAlign: 'top' };
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', font: '400 13px/18px var(--font-text)' }}>
      <thead>
        <tr>{head.map((h) => <th key={h} style={th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j} style={td}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

const Code = ({ children }: { children: ReactNode }) => <span style={{ ...mono, color: '#0100F4' }}>{children}</span>;
const Muted = ({ children }: { children: ReactNode }) => <span style={cap}>{children}</span>;

function Swatch({ token, theme }: { token: string; theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} style={{ background: 'var(--color-bg-canvas)', padding: 6, borderRadius: 14 }}>
      <div style={{ width: 64, height: 40, borderRadius: 10, background: `var(${token})`, boxShadow: 'inset 0 0 0 1px rgba(128,128,128,.25)' }} />
    </div>
  );
}

/** Таблица семантических цветов: роль, светлая/тёмная тема, переменная Figma. */
export function SemanticColors() {
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      {semanticColors.map((g) => (
        <div key={g.group}>
          <h3 style={{ font: '400 19px/24px var(--font-display)', margin: '0 0 12px' }}>{g.group}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {g.tokens.map((t) => (
              <div key={t.token} style={{ display: 'grid', gridTemplateColumns: '76px 76px 1fr', gap: 16, alignItems: 'center' }}>
                <Swatch token={t.token} theme="light" />
                <Swatch token={t.token} theme="dark" />
                <div>
                  <div style={{ ...mono, color: '#0100F4' }}>{t.token}</div>
                  <div style={{ font: '500 14px/20px var(--font-text)' }}>{t.role}</div>
                  <div style={cap}>
                    Light {t.light} · Dark {t.dark} · Figma <code>{t.figma}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ItemColorPalette() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
      {itemColors.map(([id, ru, hex]) => (
        <div key={id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }} />
          <div>
            <div style={{ font: '500 14px/20px var(--font-text)' }}>{ru}</div>
            <div style={{ ...mono, color: '#777' }}>{hex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TypeScale() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {textStyles.map(([cls, name, spec, use]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'baseline', borderBottom: '1px solid rgba(0,0,0,.08)', paddingBottom: 16 }}>
          <div className={cls}>{name === 'Caption' ? 'Подпись и мета-данные' : name === 'Body' ? 'Добавь первую вещь, чтобы начать' : 'Полный шкаф, а надеть нечего?'}</div>
          <div>
            <div style={{ font: '500 14px/20px var(--font-text)' }}>{name} · <span style={{ ...mono, color: '#0100F4' }}>.{cls}</span></div>
            <div style={cap}>{spec}</div>
            <div style={cap}>{use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpaceScale() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      {spaces.filter((s) => s >= 4).map((s) => (
        <div key={s} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
          <div style={{ width: s, height: s, background: 'rgba(1,0,244,.15)', border: '1px solid rgba(1,0,244,.4)', borderRadius: 2 }} />
          <span style={{ ...mono, color: '#777' }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

export function RadiusScale() {
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {radii.map(([token, r, use]) => (
        <div key={token} style={{ display: 'grid', gap: 6, width: 110 }}>
          <div style={{ width: 96, height: 64, background: '#F7F7F7', border: '1px solid rgba(0,0,0,.1)', borderRadius: Math.min(r, 32) }} />
          <span style={{ ...mono, color: '#0100F4' }}>{token}</span>
          <span style={cap}>{r === 999 ? 'круг' : r} · {use}</span>
        </div>
      ))}
    </div>
  );
}

export function IconGallery() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
      {(Object.keys(icons) as IconName[]).map((n) => (
        <div key={n} style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: '16px 4px', background: '#F7F7F7', borderRadius: 16 }}>
          <Icon name={n} />
          <span style={{ ...mono, color: '#777' }}>{n}</span>
        </div>
      ))}
    </div>
  );
}

/** «Ресурсы»: каждая иконка — ссылка на SVG из .downloads (npm run assets). */
export function ResourceIcons() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
      {(Object.keys(icons) as IconName[]).map((n) => (
        <a key={n} href={`./downloads/icons/ui/${n}.svg`} download style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: '16px 4px', background: 'var(--color-bg-subtle)', borderRadius: 16, color: 'var(--color-text-primary)', textDecoration: 'none' }}>
          <Icon name={n} />
          <span style={{ ...mono, color: 'var(--color-text-secondary)' }}>{n}.svg</span>
        </a>
      ))}
    </div>
  );
}

const byLevel = (l: Level) => registry.filter((e) => e.level === l).map((e) => e.code);

const levels: { level: string; what: string; rule: string; items: string[] }[] = [
  { level: 'Tokens', what: 'Значения: цвет, шрифт, отступ, радиус, тень', rule: 'Примитивы → семантика → компонентные токены', items: ['--yeet-*', '--color-*', '--space-*', '--radius-*', '--button-*'] },
  { level: 'Atoms', what: 'Неделимые элементы', rule: 'Используют только токены', items: byLevel('Atoms') },
  { level: 'Molecules', what: 'Небольшие связки атомов с одной задачей', rule: 'Собираются из атомов', items: byLevel('Molecules') },
  { level: 'Organisms', what: 'Самостоятельные блоки интерфейса', rule: 'Молекулы + атомы', items: byLevel('Organisms') },
  { level: 'Templates', what: 'Каркасы экранов без данных', rule: 'Расставляют организмы, задают скролл', items: byLevel('Templates') },
  { level: 'Pages', what: 'Экраны флоу с реальными данными', rule: 'Шаблон + содержимое', items: ['Splash', 'Onboarding', 'Auth', 'Сегодня', 'Гардероб', 'Поиск', 'Стилист', 'Поездки', 'Профиль', 'Настройки', '…'] },
];

/** Таблица соответствия Figma ↔ код из `registry.ts`. */
export function ComponentRegistry() {
  return (
    <DocTable
      head={['Уровень', 'Код', 'Figma', 'Секция Figma', 'Storybook']}
      rows={registry.map((e) => [
        <Muted>{e.level}</Muted>,
        <Code>{`<${e.code}>`}</Code>,
        <span style={mono}>{e.figma ?? '—'}{e.note && <div style={cap}>{e.note}</div>}</span>,
        <Muted>{e.section}</Muted>,
        <Muted>{e.story}</Muted>,
      ])}
    />
  );
}

export function AtomicMap() {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {levels.map((l, i) => (
        <div key={l.level} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, padding: 16, borderRadius: 20, background: `rgba(1,0,244,${0.04 + i * 0.025})` }}>
          <div>
            <div style={{ font: '400 19px/24px var(--font-display)' }}>{l.level}</div>
            <div style={cap}>{l.rule}</div>
          </div>
          <div>
            <div style={{ font: '500 14px/20px var(--font-text)', marginBottom: 8 }}>{l.what}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {l.items.map((it) => (
                <span key={it} style={{ ...mono, padding: '4px 10px', borderRadius: 32, background: '#fff', border: '1px solid rgba(0,0,0,.08)' }}>{it}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div style={{ padding: '16px 20px', background: '#F7F7F7', borderRadius: 20 }}>
      <div style={{ font: '380 32px/36px var(--font-display)', letterSpacing: -1 }}>{value}</div>
      <div style={cap}>{label}</div>
    </div>
  );
}

export function Stats({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, margin: '16px 0 24px' }}>{children}</div>;
}

/** Таблица семантических токенов движения. */
export function MotionTable() {
  return (
    <DocTable
      head={['Переход', 'Токен', 'Кривая', 'Что происходит', 'Где', 'Кадр Figma']}
      rows={motions.map((m) => [
        <span style={{ fontWeight: 500 }}>{m.name}<div style={cap}>{m.trigger}</div></span>,
        <Code>{m.token}</Code>,
        <Muted>{m.curve}</Muted>,
        m.what,
        <Muted>{m.where}</Muted>,
        <Muted>{m.figma}</Muted>,
      ])}
    />
  );
}

/** «11 · 17 · 16» — число атомов, молекул и организмов из реестра. */
export const levelCounts = () => (['Atoms', 'Molecules', 'Organisms'] as const).map((l) => byLevel(l).length).join(' · ');

/** Хаптика из tokens.json → motion.haptic: событие, iOS, Android. */
export function HapticTable() {
  const ios = (v: string) => {
    const [kind, style] = v.split(':');
    return kind === 'selection' ? 'UISelectionFeedbackGenerator' : kind === 'impact' ? `UIImpactFeedbackGenerator(.${style})` : `UINotificationFeedbackGenerator(.${style})`;
  };
  return (
    <DocTable
      head={['Событие', 'Когда', 'iOS', 'Android', 'Токен']}
      rows={Object.entries(tokenSource.motion.haptic).map(([k, h]) => {
        const hh = h as typeof h & { androidMin?: number; androidFallback?: string };
        return [
          <span style={{ fontWeight: 500 }}>{k}</span>,
          <span>{h.when}<div style={cap}>{h.use}</div></span>,
          <Code>{ios(h.ios)}</Code>,
          <span><Code>{h.android}</Code>{hh.androidMin && <div style={cap}>API {hh.androidMin}+, ниже — {hh.androidFallback}</div>}</span>,
          <Muted>YeetHaptic.{k}</Muted>,
        ];
      })}
    />
  );
}

/** Один экран на нескольких ширинах: проверка резиновой вёрстки. `render` — функция истории экрана (Pages). */
export function AtWidths({ render, widths = [[320, 568], [393, 852], [430, 932]] }: { render: () => ReactNode; widths?: [number, number][] }) {
  const Screen = () => <>{render()}</>;
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', overflowX: 'auto', padding: '8px 0' }}>
      {widths.map(([w, h]) => (
        <figure key={w} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8, ['--screen-width' as string]: `${w}px`, ['--screen-height' as string]: `${Math.min(h, 760)}px` }}>
          <Screen />
          <figcaption style={{ font: '400 12px/16px var(--font-text)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>{w} × {h}</figcaption>
        </figure>
      ))}
    </div>
  );
}
