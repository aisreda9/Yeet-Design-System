import { useEffect, type KeyboardEvent, type RefObject } from 'react';

/*
 * FocusScope — модальная область фокуса: общий примитив для слоёв (Overlay со Sheet / Dialog; дальше — ActionSheet,
 * ImageViewer). Портала нет намеренно: слой живёт в экране (`Screen overlay`), а фон — его соседи, которые получают `inert`.
 */

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Поле и ползунок не берут фокус при открытии: на телефоне поле подняло бы клавиатуру. */
const FIELD = 'input, textarea, select, [role=slider], [contenteditable]';

/** Элементы в порядке Tab внутри `root`: видимые, не выключенные, не в `inert`. */
export const tabbables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => el.tabIndex >= 0 && !el.closest('[inert]') && el.getClientRects().length > 0,
  );

/** Последний ввод — клавиатура? Область, открытая мышью, пальцем или сразу на экране, не рисует кольцо фокуса при открытии. */
let keyboardInput = false;
if (typeof document !== 'undefined') {
  document.addEventListener(
    'keydown',
    (e) => {
      if (!e.metaKey && !e.altKey && !e.ctrlKey) keyboardInput = true;
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      keyboardInput = false;
    },
    true,
  );
}

export type FocusScopeOptions = {
  /** Область активна: фокус внутри, фон `inert`. `false` (уход с анимацией) — фон возвращается, фокус — туда, откуда открыли. */
  active?: boolean;
  /** Куда ставить фокус при открытии: контейнер, в котором искать `[data-autofocus]` и первый элемент. По умолчанию — сама область. */
  initial?: () => HTMLElement | null;
};

/**
 * Модальная область фокуса на узле `ref`:
 * - при открытии фокус — на `[data-autofocus]`, иначе на первый элемент в порядке Tab (кроме полей), иначе на контейнер;
 *   кольцо фокуса рисуется, только если открыли с клавиатуры (`data-focus-quiet` до первой клавиши);
 * - соседи области (шапка, контент, низ экрана) получают `inert`;
 * - если содержимое сменилось и фокус выпал (Sheet → Dialog в том же слое), он возвращается внутрь;
 * - при уходе фон возвращается, фокус — на элемент, с которого открыли.
 *
 * Возвращает обработчик `keydown` для фокус-ловушки: Tab и Shift+Tab по кругу внутри области.
 */
export function useFocusScope(ref: RefObject<HTMLElement | null>, { active = true, initial }: FocusScopeOptions = {}) {
  useEffect(() => {
    const o = ref.current;
    if (!o || !active) return;
    const opener =
      document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement
        : null;
    const background = [...(o.parentElement?.children ?? [])].filter(
      (el): el is HTMLElement => el !== o && el instanceof HTMLElement && !el.inert,
    );
    background.forEach((el) => {
      el.inert = true;
    });
    const focusInto = () => {
      if (o.contains(document.activeElement)) return;
      const s = initial?.() ?? o;
      const target =
        s.querySelector<HTMLElement>('[data-autofocus]') ?? tabbables(s).find((el) => !el.closest(FIELD)) ?? s;
      if (target === s && !s.hasAttribute('tabindex')) s.tabIndex = -1;
      if (!keyboardInput) {
        // кольцо фокуса — только когда пользователь идёт с клавиатуры (focus({ focusVisible }) Chromium пока не умеет)
        target.dataset.focusQuiet = '';
        const loud = () => {
          delete target.dataset.focusQuiet;
          target.removeEventListener('blur', loud);
          o.removeEventListener('keydown', loud);
        };
        target.addEventListener('blur', loud);
        o.addEventListener('keydown', loud);
      }
      target.focus({ preventScroll: true });
    };
    focusInto();
    // содержимое сменилось (Sheet → Dialog): фокус ушёл бы в body вместе со старым узлом (C6)
    const swap = new MutationObserver(focusInto);
    swap.observe(o, { childList: true });
    return () => {
      swap.disconnect();
      background.forEach((el) => {
        el.inert = false;
      });
      const now = document.activeElement;
      if (opener?.isConnected && (!now || now === document.body || o.contains(now)))
        opener.focus({ preventScroll: true });
    };
    // initial читается при открытии и смене содержимого; перезапуск — только по active
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (e: KeyboardEvent) => {
    const o = ref.current;
    if (!o || !active || e.key !== 'Tab') return;
    const list = tabbables(o);
    const first = list[0],
      last = list[list.length - 1],
      now = document.activeElement;
    if (!first) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey && (now === first || !list.includes(now as HTMLElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (now === last || !list.includes(now as HTMLElement))) {
      e.preventDefault();
      first.focus();
    }
  };
}
