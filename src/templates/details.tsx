import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { Header, type HeaderProps, Sheet } from '../organisms';
import { cx } from '../utils/cx';
import { Screen } from '.';

type BarProps = Extract<HeaderProps, { type: 'bar' }>;

export type DetailsScreenProps = {
  /** Фото вещи, коллаж образа или `PhotoArea` — квадрат во всю ширину под шапкой. */
  media: ReactNode;
  /**
   * Миниатюра 48 в шапке, когда фото свёрнуто. По умолчанию — само фото, уменьшенное до 48:
   * у вещи — вещь на подложке, у образа — мини-коллаж (Figma `349:10424`, `349:10441`).
   */
  thumb?: ReactNode;
  /** Заголовок панели (H2). */
  title?: string;
  /** Пилюля по центру шапки в покое («Новая вещь»); при сворачивании её место занимает миниатюра. */
  titleChip?: string;
  /** Кнопки справа в шапке. По умолчанию — «Ещё». */
  actions?: BarProps['actions'];
  onBack?: () => void;
  /** Закреплённый низ: `BottomBar`. */
  bottom?: ReactNode;
  /** Штамп «Надеть»: закреплён поверх контента справа внизу и не едет со скроллом (Figma `1371:41156`, `1371:41329`). */
  stamp?: ReactNode;
  overlay?: ReactNode;
  scrollRef?: RefObject<HTMLElement | null>;
  /** Содержимое панели. */
  children?: ReactNode;
};

/**
 * Детали вещи и образа (Figma: Wardrobe / Item Details `1371:41024 → 1371:41076`, Outfit Details `1371:41156 → 1371:41329`,
 * Animations «new things» `354:17405 → 354:17449`).
 *
 * В покое: фото 353 на y138, под ним панель с хэндлом на y511. После 24 pt скролла (`Screen` → `data-collapsed`):
 * - панель поднимается поверх фото — на y138, если прокручено ровно на порог;
 * - фото сворачивается в миниатюру 48 по центру шапки (translate + scale, `--motion-collapse`);
 * - низ (`BottomBar`) остаётся на месте.
 * Обратно — при возврате к началу. При «Уменьшении движения» токен `--motion-collapse` = 1 мс: миниатюра появляется сразу.
 */
export function DetailsScreen({ media, thumb, title, titleChip, actions = [{ icon: 'more', label: 'Ещё' }], onBack, bottom, stamp, overlay, scrollRef, children }: DetailsScreenProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  // Цель морфа считается от ширины экрана: фото во всю ширину минус поля → квадрат 48 по центру шапки
  useLayoutEffect(() => {
    const el = mediaRef.current;
    const screen = el?.parentElement;
    if (!el || !screen) return;
    const measure = () => {
      const w = el.offsetWidth;
      if (!w) return;
      el.style.setProperty('--details-scale', String(48 / w));
      el.style.setProperty('--details-dx', `${(screen.clientWidth - 48) / 2 - el.offsetLeft}px`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(screen);
    return () => ro.disconnect();
  }, []);

  return (
    <Screen
      className={cx('y-details', thumb != null && 'y-details--thumb')}
      /* отдельный шаблон: шапка закреплена, фото сворачивается в миниатюру по data-collapsed — правило #170 сюда не относится */
      pinHeader
      header={<Header type="bar" titleChip={titleChip} actions={actions} onBack={onBack} centerOnScroll={thumb} />}
      backdrop={
        <>
          <div ref={mediaRef} className="y-details__media">{media}</div>
          {stamp && <div className="y-details__stamp">{stamp}</div>}
        </>
      }
      bottom={bottom}
      overlay={overlay}
      scrollRef={scrollRef}
      flush
    >
      {/* место фото в потоке: схлопывается, и панель поднимается */}
      <div className="y-details__spacer" aria-hidden><span /></div>
      <Sheet type="panel" title={title}>{children}</Sheet>
    </Screen>
  );
}
