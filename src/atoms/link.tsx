import type { ComponentPropsWithRef } from 'react';
import { cx } from '../utils/cx';

/* ─── Link ──────────────────────────────────────────────────────────── */

export type LinkProps = ComponentPropsWithRef<'a'> & {
  href: string;
  /**
   * Внешняя ссылка: открывается в новой вкладке с `rel="noopener noreferrer"`.
   * По умолчанию — сама, если `href` ведёт на http(s); `mailto:` и `tel:` внешними не считаются.
   */
  external?: boolean;
};

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * Инлайн-ссылка внутри текста: цвет и шрифт окружающего текста (Caption, Body), подчёркивание, видимый фокус,
 * зона нажатия ≥ 44 (невидимый `::after`). Не кнопка: действие без адреса — `Button variant="ghost"`.
 *
 * **Контексты:** юридическая подпись на входе («условиями» · «политикой конфиденциальности»), диалог удаления аккаунта, e-mail в Legal.
 */
export function Link({ href, external = isExternal(href), className, target, rel, ...rest }: LinkProps) {
  return (
    <a
      href={href}
      className={cx('y-link', className)}
      target={target ?? (external ? '_blank' : undefined)}
      rel={rel ?? (external ? 'noopener noreferrer' : undefined)}
      {...rest}
    />
  );
}
