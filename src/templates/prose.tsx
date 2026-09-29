import { Fragment, type ReactNode } from 'react';
import { cx } from '../utils/cx';

/** Абзац (строка) · важный абзац чёрным (`{ strong }`) · маркированный список (`{ list }`). */
export type ProseBlock = string | { strong: string } | { list: string[] };
export type ProseSection = { title: string; body: ProseBlock[] };

export type ProseProps = {
  /** H1 документа: «Политика конфиденциальности». */
  title: string;
  /** Строка под заголовком: «Обновлено · Май 2026». */
  updated?: string;
  sections: ProseSection[];
  /** Последний раздел в карточке: контакты для вопросов. */
  contact?: ProseSection;
};

const email = /([\w.+-]+@[\w-]+\.[\w.]+)/g;

/** Почта в тексте становится ссылкой mailto: чёрным с подчёркиванием (Figma Legal). */
function linkify(text: string): ReactNode {
  return text.split(email).map((part, i) => (i % 2 ? <a key={i} href={`mailto:${part}`}>{part}</a> : <Fragment key={i}>{part}</Fragment>));
}

function Block({ block }: { block: ProseBlock }) {
  if (typeof block === 'string') return <p>{linkify(block)}</p>;
  if ('strong' in block) return <p className="y-text--primary">{linkify(block.strong)}</p>;
  return <ul>{block.list.map((item) => <li key={item}>{linkify(item)}</li>)}</ul>;
}

function Section({ section, card }: { section: ProseSection; card?: boolean }) {
  return (
    <section className={cx('y-prose__section', card && 'y-prose__card')}>
      <h2 className="y-h2 y-text--primary">{section.title}</h2>
      {section.body.map((b, i) => <Block key={i} block={b} />)}
    </section>
  );
}

/**
 * Документ из текста: политика конфиденциальности, условия использования (Figma Legal `513:6603`, `513:6707`).
 * H1 и дата, разделы через 24 (H2, абзацы и списки через 12), текст Body серым, почта — ссылкой.
 * Ставится в `Screen` с шапкой `bar` без заголовка: документ читается от H1.
 */
export function Prose({ title, updated, sections, contact }: ProseProps) {
  return (
    <article className="y-prose y-body y-text--secondary" lang="ru">
      <header className="y-prose__head">
        <h1 className="y-h1 y-text--primary">{title}</h1>
        {updated && <p>{updated}</p>}
      </header>
      {sections.map((s) => <Section key={s.title} section={s} />)}
      {contact && <Section section={contact} card />}
    </article>
  );
}
