/** Метаданные анимаций: пресеты Figma Smart Animate → токены кода. */
export type Curve = { token: string; figma: string; duration: number; kind: 'bezier' | 'spring'; spring?: { k: number; c: number }; bezier?: [number, number, number, number] };

export const curves: Curve[] = [
  { token: '--ease-out', figma: 'Ease out', duration: 300, kind: 'bezier', bezier: [0, 0, 0.58, 1] },
  { token: '--spring-quick', figma: 'Quick', duration: 744, kind: 'spring', spring: { k: 300, c: 20 } },
  { token: '--spring-bouncy', figma: 'Bouncy', duration: 958, kind: 'spring', spring: { k: 600, c: 15 } },
  { token: '--spring-gentle', figma: 'Gentle', duration: 1022, kind: 'spring', spring: { k: 100, c: 15 } },
];

/** Значение кривой в момент t ∈ [0, 1] (доля длительности). */
export function sample(c: Curve, t: number): number {
  if (c.kind === 'spring' && c.spring) {
    const { k, c: d } = c.spring;
    const w0 = Math.sqrt(k), z = d / (2 * w0), wd = w0 * Math.sqrt(1 - z * z), s = (t * c.duration) / 1000;
    return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + ((z * w0) / wd) * Math.sin(wd * s));
  }
  const [x1, y1, x2, y2] = c.bezier!;
  // решаем x(u) = t бинарным поиском, возвращаем y(u)
  const bz = (u: number, a: number, b: number) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u ** 2 * b + u ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bz(m, x1, x2) < t) lo = m; else hi = m; }
  return bz((lo + hi) / 2, y1, y2);
}

export type MotionSpec = { name: string; token: string; curve: string; trigger: string; what: string; where: string; figma: string };

export const motions: MotionSpec[] = [
  { name: 'Нажатие', token: '--motion-press', curve: '150 мс · standard', trigger: 'tap', what: 'scale 0.97', where: 'Все кнопки', figma: '—' },
  { name: 'Сворачивание фото', token: '--motion-collapse', curve: '300 мс · ease-out', trigger: 'скролл / drag', what: 'Фото 353 → превью 52 в шапке, панель деталей поднимается', where: 'Детали вещи', figma: 'new things' },
  { name: 'Листание', token: '--motion-page', curve: '300 мс · ease-out', trigger: 'свайп', what: 'Образ уезжает на ширину экрана, чипсы поводов сдвигаются к активному', where: 'Стилист / С чем носить, Поездки', figma: 'Stylist / Trips / List' },
  { name: 'Таб-бар и FAB', token: '--motion-nav', curve: '744 мс · spring quick', trigger: 'смена вкладки', what: 'Таб-бар 353 → 290, кнопка «+» появляется справа', where: 'Гардероб, Вишлист', figma: 'default → things' },
  { name: 'Штамп', token: '--motion-stamp', curve: '958 мс · spring bouncy', trigger: 'tap', what: 'Звезда 148 → 78, поворот −60°, «Надеть» → «×»', where: 'Образы на сегодня, С чем носить', figma: 'dropdown → active button' },
  { name: 'Смена образа', token: '--motion-swap', curve: '1022 мс · spring gentle', trigger: 'свайп вверх', what: 'Текущий коллаж сжимается в превью сверху, следующий вырастает из превью снизу; штамп поворачивается на 180°', where: 'Образы на сегодня', figma: 'scale' },
];

/**
 * Механики экранов: что движется, на каком токене, сколько длится, какая хаптика и что остаётся при «Уменьшении движения».
 * Сводная таблица на странице «Анимации» строится отсюда.
 */
export type Mechanic = { group: string; name: string; what: string; token: string; duration: string; haptic: string; reduced: string; where: string };

const instant = 'мгновенно (токены → 1 мс)';
const finger = 'палец ведёт 1 : 1, доводка мгновенная';

export const mechanics: Mechanic[] = [
  // Слои
  { group: 'Слои', name: 'Шторка: появление', what: 'снизу из-за края (100 % + 8), затемнение проявляется', token: '--motion-nav · --motion-fade', duration: '744 мс quick · 240 мс', haptic: '—', reduced: instant, where: 'Overlay + Sheet / Dialog / AccountsSheet' },
  { group: 'Слои', name: 'Шторка: уход', what: 'вниз за край целиком, затемнение гаснет; из текущего положения', token: '--motion-exit', duration: '150 мс', haptic: '—', reduced: instant, where: 'Overlay, Screen → overlay' },
  { group: 'Слои', name: 'Шторка: смахивание', what: '1 : 1 вниз, вверх — резинка 0.55; > 30 % высоты или бросок > 500 pt/с — закрыть, иначе назад', token: '--gesture-swipe-distance · --gesture-swipe-velocity · --gesture-rubber-band · --motion-nav', duration: 'возврат 744 мс quick', haptic: 'threshold — один раз на пороге', reduced: finger, where: 'Overlay (onClose)' },
  { group: 'Слои', name: 'Переход экрана push / pop', what: 'новый экран справа, старый сдвигается на 30 % и темнеет; назад — свайпом от края', token: '--motion-page', duration: '300 мс ease-out', haptic: 'threshold на пороге свайпа назад', reduced: instant, where: 'нативная навигация (демо)' },
  // Навигация
  { group: 'Навигация', name: 'Таб-бар: пилюля', what: 'подложка переезжает к вкладке (transform + width)', token: '--motion-nav', duration: '744 мс quick', haptic: 'select', reduced: instant, where: 'TabBar' },
  { group: 'Навигация', name: 'FAB «+»', what: 'таб-бар 353 → 290, «+» вырастает справа; уход быстрее', token: '--motion-nav · --motion-fade / --motion-exit', duration: '744 мс quick · 240 / 150 мс', haptic: '—', reduced: instant, where: 'BottomNav (fab)' },
  { group: 'Навигация', name: 'Сегмент', what: 'пилюля inverse переезжает, цвет подписи', token: '--motion-nav · --motion-select', duration: '744 мс quick · 150 мс', haptic: 'select', reduced: instant, where: 'SegmentControl' },
  { group: 'Навигация', name: 'Шапка при скролле', what: 'большой заголовок гаснет и уменьшается, пилюля по центру вырастает; гистерезис 24 / 8 px', token: '--motion-lift · --motion-fade / --motion-exit', duration: '744 мс quick · 240 / 150 мс', haptic: '—', reduced: instant, where: 'Header large / back + Screen' },
  { group: 'Навигация', name: 'Липкие фильтры, края скролла', what: 'полоса затухания проявляется, когда под краем есть контент', token: '--motion-fade', duration: '240 мс', haptic: '—', reduced: instant, where: 'Sticky, ScrollEdge' },
  // Нажатие и выбор
  { group: 'Нажатие и выбор', name: 'Кнопка, иконка, вкладка', what: 'scale 0.97 на касании', token: '--gesture-press-scale · --motion-press', duration: '150 мс', haptic: '—', reduced: instant, where: 'Button, IconButton, TabBar' },
  { group: 'Нажатие и выбор', name: 'Карточка', what: 'scale 0.98 через 80 мс (в скролле не мигает)', token: '--gesture-press-scale-card · --gesture-press-delay', duration: '150 мс', haptic: '—', reduced: instant, where: 'ItemCard, PhotoTile, TripCard, AccountCard' },
  { group: 'Нажатие и выбор', name: 'Строка списка', what: 'в группе — фон border-subtle, в шторке — прозрачность 0.64; без сжатия', token: '--motion-select · --motion-press', duration: '150 мс', haptic: '—', reduced: instant, where: 'ListGroup, List' },
  { group: 'Нажатие и выбор', name: 'Чипс, радио', what: 'фон и цвет', token: '--motion-select', duration: '150 мс', haptic: 'select', reduced: instant, where: 'ChipGroup, ListItem radio' },
  { group: 'Нажатие и выбор', name: 'Лайк', what: 'сердце заливается и подпрыгивает 0.6 → 1 (только от нажатия)', token: '--motion-drop', duration: '744 мс quick', haptic: 'toggle', reduced: 'цвет сразу, без прыжка', where: 'ProductCard' },
  { group: 'Нажатие и выбор', name: 'Галочка вещи', what: 'появляется 0.4 → 1 на пружине', token: '--motion-drop', duration: '744 мс quick', haptic: 'toggle', reduced: 'появляется сразу', where: 'ItemCard selected' },
  // Главная
  { group: 'Главная', name: 'Смена образа свайпом', what: 'стопка едет за пальцем; превью ↔ коллаж; звезда штампа +180°', token: '--motion-swap · жесты', duration: '1022 мс gentle', haptic: 'threshold на пороге, skip при смене', reduced: finger, where: 'Образы на сегодня' },
  { group: 'Главная', name: 'Штамп «Надеть»', what: 'нажатие 0.94; выполнено: 148 → 78, −60°, чёрный, «отменить»', token: '--gesture-press-scale-stamp · --motion-stamp', duration: '150 мс · 958 мс bouncy', haptic: 'stamp в пик пружины (~120 мс)', reduced: instant, where: 'Stamp' },
  { group: 'Главная', name: 'Штамп «Не нравится»', what: 'нажатие 0.94, образ уходит', token: '--gesture-press-scale-stamp · --motion-exit', duration: '150 мс', haptic: 'skip', reduced: instant, where: 'Stamp secondary' },
  { group: 'Главная', name: 'Погода', what: 'проявляется снизу на 8 pt после коллажа (+160 мс), наклон сохраняется', token: '--motion-appear', duration: '240 мс', haptic: '—', reduced: instant, where: 'WeatherCard на главной' },
  // Обратная связь
  { group: 'Обратная связь', name: 'Snackbar', what: 'снизу 16 pt + прозрачность; уход 8 pt; сам — через 4 с (с «Отменить» 6 с), пауза под курсором и фокусом', token: '--motion-appear / --motion-exit · --gesture-snackbar', duration: '240 / 150 мс', haptic: '—', reduced: instant, where: 'Snackbar autoHide, Screen → floating' },
  { group: 'Обратная связь', name: 'Подсказка', what: 'прозрачность + сдвиг 8 pt', token: '--motion-appear', duration: '240 мс', haptic: '—', reduced: instant, where: 'Hint' },
  { group: 'Обратная связь', name: 'Загрузка: удаление фона', what: 'spin крутится, по площадке проходит блик (transform); подпись — через 120 мс', token: 'keyframes y-spin / y-shimmer · --motion-appear', duration: '1.2 с / 1.6 с цикл', haptic: 'success, когда вещь распознана', reduced: 'пульсация прозрачности, без блика', where: 'LoadingState, PhotoArea' },
  // Перетаскивание
  { group: 'Перетаскивание', name: 'Холст: подъём и бросок', what: 'касание — scale 1.04 + тень; отпускание — садится на место', token: '--gesture-lift-scale · --motion-lift / --motion-drop', duration: '744 мс quick', haptic: 'lift → drop', reduced: 'без масштаба, только тень', where: 'OutfitCanvas' },
  { group: 'Перетаскивание', name: 'Холст: щипок', what: 'размер 40–300 %; за границей — резинка через scale, после — назад', token: '--gesture-rubber-band · --motion-drop', duration: '744 мс quick', haptic: 'threshold один раз', reduced: finger, where: 'OutfitCanvas' },
  { group: 'Перетаскивание', name: 'Сетка: перестановка', what: 'долгое нажатие 400 мс → подъём; цель 1.02; соседи съезжают (FLIP); мимо — назад', token: '--gesture-long-press · --motion-drop · --motion-return', duration: '744 мс quick · 1022 мс gentle', haptic: 'lift, target, drop', reduced: 'без масштаба, только тень и обводка', where: 'DragGrid' },
  { group: 'Перетаскивание', name: 'Сетка: в корзину', what: 'сжатие 0.6 + исчезновение, snackbar «Отменить»', token: '--motion-exit · --gesture-snackbar', duration: '150 мс', haptic: 'delete', reduced: instant, where: 'DragGrid' },
  // Профиль и листание
  { group: 'Профиль', name: 'Аккаунты', what: 'шторка из стопки аватаров; переключение — шторка уходит, профиль сменяется проявлением', token: '--motion-nav / --motion-exit · --motion-appear', duration: '744 / 150 / 240 мс', haptic: 'select при переключении', reduced: instant, where: 'AvatarStack, AccountsSheet' },
  { group: 'Профиль', name: 'Период', what: 'выбор чипса виден 150 мс, затем шторка уходит', token: '--motion-select → --motion-exit', duration: '150 + 150 мс', haptic: 'select', reduced: instant, where: 'Профиль / Статистика' },
  { group: 'Листание', name: 'Поводы, карусель', what: 'лента за пальцем; > 30 % или бросок — следующий; края — резинка; карусель — нативный snap', token: '--motion-page · жесты', duration: '300 мс ease-out', haptic: 'threshold на пороге', reduced: finger, where: 'Стилист, Поездки, Carousel' },
];
