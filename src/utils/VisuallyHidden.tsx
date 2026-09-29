import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';

export type VisuallyHiddenProps = ComponentPropsWithRef<'span'>;

/**
 * Текст только для скринридера: в дереве доступности есть, на экране не виден и места не занимает.
 * **Контексты:** «Загрузка» у кнопки со спиннером, подпись иконочного сегмента, пояснение к числу («из 120»).
 * Для имени самого элемента проще `aria-label`; VisuallyHidden — когда текст должен читаться в потоке.
 */
export function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span className={cx('y-visually-hidden', className)} {...rest} />;
}
