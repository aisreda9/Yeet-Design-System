// Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.
// Jetpack Compose. Схемы light / dark — выбирать по isSystemInDarkTheme(); в модуле native/android — через YeetTheme.

package design.yeet.tokens

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import android.os.Build
import android.view.HapticFeedbackConstants
import android.view.View
import androidx.annotation.FontRes
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Immutable
data class YeetColorScheme(
    // Поверхности
    /** Фон экрана · Figma ui-colors/white */
    val bgCanvas: Color,
    /** Поднятые поверхности: tab-bar, sheet, dialog, hint · Figma ui-colors/elevated */
    val bgElevated: Color,
    /** Карточки, поля, tertiary-кнопки · Figma ui-colors/light-grey */
    val bgSubtle: Color,
    /** Snackbar, Secondary-кнопка, погода · Figma ui-colors/bg-inverse */
    val bgInverse: Color,
    /** Затемнение под модальным sheet · Figma ui-colors/overlay */
    val bgOverlay: Color,
    // Контент
    /** Основной текст и иконки · Figma ui-colors/black */
    val textPrimary: Color,
    /** Вторичный текст, лейблы, подписи · Figma ui-colors/grey */
    val textSecondary: Color,
    /** Текст на inverse-поверхности · Figma ui-colors/text-inverse */
    val textInverse: Color,
    /** Текст и иконки на accent / danger · Figma ui-colors/on-accent */
    val textOnAccent: Color,
    /** Вторичный текст на inverse-поверхности: подпись в карточке погоды · Figma ui-colors/inverse-secondary */
    val textInverseSecondary: Color,
    /** Текст на danger (бейдж скидки) — белый в любом бренде · Figma ui-colors/on-accent */
    val textOnDanger: Color,
    /** Статус-бар, логотип, подсказка и иконки поверх фото и тёмной камеры (Splash, Search / Photo / Crop) — белый в любой теме и бренде · Figma ui-colors/white */
    val textOnPhoto: Color,
    /** Акцентный текст, выбранное · Figma ui-colors/blue-text */
    val textAccent: Color,
    /** Ошибки, деструктивные действия · Figma ui-colors/red-text */
    val textDanger: Color,
    // Акцент, обратная связь, линии
    /** Главное действие, выбранное, фокус · Figma ui-colors/blue */
    val accent: Color,
    /** Фон выбранного чипса (Soft) и сообщения пользователя. Light — сплошной #F1F4FF, а не прозрачный: на сером фоне не темнеет · Figma ui-colors/blue-10% */
    val accentSoft: Color,
    /** Удаление, ошибка, бейдж скидки · Figma ui-colors/red */
    val danger: Color,
    /** Фон Destructive-кнопки · Figma ui-colors/red-10% */
    val dangerSoft: Color,
    /** Обводки свотчей, гистограмма, фон неактивных точек · Figma ui-colors/black-10% */
    val borderSubtle: Color,
    /** Разделители строк в input-group и list-group · Figma ui-colors/divider */
    val divider: Color,
    /** Точки фона коллажа и холста (2 px, шаг 10) · Figma ui-colors/pattern-dot */
    val patternDot: Color,
    /** Хэндл шторки: декоративный, ≈ 1,5:1 к bg-elevated (D8, #58) · Figma ui-colors/handle */
    val handle: Color,
    /** Цвет плавающей тени shadow/floating · Figma ui-colors/shadow */
    val shadow: Color,
)

val YeetLightColors = YeetColorScheme(
    bgCanvas = Color(0xFFFFFFFF),
    bgElevated = Color(0xFFFFFFFF),
    bgSubtle = Color(0xFFF7F7F7),
    bgInverse = Color(0xFF000000),
    bgOverlay = Color(0x66000000),
    textPrimary = Color(0xFF000000),
    textSecondary = Color(0xFF6E6E6E),
    textInverse = Color(0xFFFFFFFF),
    textOnAccent = Color(0xFFFFFFFF),
    textInverseSecondary = Color(0xFFA7B3BF),
    textOnDanger = Color(0xFFFFFFFF),
    textOnPhoto = Color(0xFFFFFFFF),
    textAccent = Color(0xFF0100F4),
    textDanger = Color(0xFFCC291B),
    accent = Color(0xFF0100F4),
    accentSoft = Color(0xFFF1F4FF),
    danger = Color(0xFFCC291B),
    dangerSoft = Color(0x1AFF4230),
    borderSubtle = Color(0x1A000000),
    divider = Color(0x0D000000),
    patternDot = Color(0x3B000000),
    handle = Color(0x2B000000),
    shadow = Color(0x1F000000),
)

val YeetDarkColors = YeetColorScheme(
    bgCanvas = Color(0xFF0F0F11),
    bgElevated = Color(0xFF1A1A1E),
    bgSubtle = Color(0xFF26262B),
    bgInverse = Color(0xFFF5F5F7),
    bgOverlay = Color(0x99000000),
    textPrimary = Color(0xFFF5F5F7),
    textSecondary = Color(0xFF8E8E93),
    textInverse = Color(0xFF0F0F11),
    textOnAccent = Color(0xFFFFFFFF),
    textInverseSecondary = Color(0xFF5B6470),
    textOnDanger = Color(0xFFFFFFFF),
    textOnPhoto = Color(0xFFFFFFFF),
    textAccent = Color(0xFF8A8AFF),
    textDanger = Color(0xFFFF6B5C),
    accent = Color(0xFF4B4BFF),
    accentSoft = Color(0x334B4BFF),
    danger = Color(0xFFCC291B),
    dangerSoft = Color(0x2EFF6B5C),
    borderSubtle = Color(0x1FF5F5F7),
    divider = Color(0x14F5F5F7),
    patternDot = Color(0x3BF5F5F7),
    handle = Color(0x24F5F5F7),
    shadow = Color(0x80000000),
)

// Повышенный контраст (#117): Android 14+ — UiModeManager.getContrast(); в модуле native/android — YeetTheme(highContrast = …).
val YeetLightContrastColors = YeetColorScheme(
    bgCanvas = Color(0xFFFFFFFF),
    bgElevated = Color(0xFFFFFFFF),
    bgSubtle = Color(0xFFF7F7F7),
    bgInverse = Color(0xFF000000),
    bgOverlay = Color(0x66000000),
    textPrimary = Color(0xFF000000),
    textSecondary = Color(0xFF545454),
    textInverse = Color(0xFFFFFFFF),
    textOnAccent = Color(0xFFFFFFFF),
    textInverseSecondary = Color(0xFFA7B3BF),
    textOnDanger = Color(0xFFFFFFFF),
    textOnPhoto = Color(0xFFFFFFFF),
    textAccent = Color(0xFF0100F4),
    textDanger = Color(0xFFA22115),
    accent = Color(0xFF0100F4),
    accentSoft = Color(0xFFF1F4FF),
    danger = Color(0xFFCC291B),
    dangerSoft = Color(0x1AFF4230),
    borderSubtle = Color(0x6E000000),
    divider = Color(0x6E000000),
    patternDot = Color(0x3B000000),
    handle = Color(0x2B000000),
    shadow = Color(0x1F000000),
)

val YeetDarkContrastColors = YeetColorScheme(
    bgCanvas = Color(0xFF0F0F11),
    bgElevated = Color(0xFF1A1A1E),
    bgSubtle = Color(0xFF26262B),
    bgInverse = Color(0xFFF5F5F7),
    bgOverlay = Color(0x99000000),
    textPrimary = Color(0xFFF5F5F7),
    textSecondary = Color(0xFFB2B2B5),
    textInverse = Color(0xFF0F0F11),
    textOnAccent = Color(0xFFFFFFFF),
    textInverseSecondary = Color(0xFF4C535D),
    textOnDanger = Color(0xFFFFFFFF),
    textOnPhoto = Color(0xFFFFFFFF),
    textAccent = Color(0xFFAAAAFF),
    textDanger = Color(0xFFFF9489),
    accent = Color(0xFF5858FF),
    accentSoft = Color(0x334B4BFF),
    danger = Color(0xFFCC291B),
    dangerSoft = Color(0x2EFF6B5C),
    borderSubtle = Color(0x5CF5F5F7),
    divider = Color(0x5CF5F5F7),
    patternDot = Color(0x3BF5F5F7),
    handle = Color(0x24F5F5F7),
    shadow = Color(0x80000000),
)

// Компонентные токены (web: --button-*, --card-*, --sheet-*, --tab-bar-*, --input-*)
val YeetColorScheme.buttonPrimaryBg: Color get() = accent
val YeetColorScheme.buttonPrimaryFg: Color get() = textOnAccent
val YeetColorScheme.buttonSecondaryBg: Color get() = bgInverse
val YeetColorScheme.buttonSecondaryFg: Color get() = textInverse
val YeetColorScheme.buttonTertiaryBg: Color get() = bgSubtle
val YeetColorScheme.buttonTertiaryFg: Color get() = textPrimary
val YeetColorScheme.buttonInverseBg: Color get() = bgElevated
val YeetColorScheme.buttonInverseFg: Color get() = textPrimary
val YeetColorScheme.buttonGhostBg: Color get() = Color.Transparent
val YeetColorScheme.buttonGhostFg: Color get() = textPrimary
val YeetColorScheme.buttonSoftBg: Color get() = accentSoft
val YeetColorScheme.buttonSoftFg: Color get() = textAccent
val YeetColorScheme.buttonDestructiveBg: Color get() = dangerSoft
val YeetColorScheme.buttonDestructiveFg: Color get() = textDanger
val YeetColorScheme.cardBg: Color get() = bgSubtle
val YeetColorScheme.sheetBg: Color get() = bgElevated
val YeetColorScheme.tabBarBg: Color get() = bgElevated
val YeetColorScheme.inputBg: Color get() = bgSubtle
/** Хэндл шторки, 48 × 4 (D8) */
val YeetColorScheme.sheetHandle: Color get() = handle

object YeetComponent {
    val cardRadius = YeetRadius.lg
    val sheetRadius = YeetRadius.xl
    /** Верх высокой шторки: 8 под статус-баром (D2). Web — статус-бар + 8, натив — 8 от safe area top */
    val sheetTopGap = YeetSpace.s8
    /** Заголовок → контент и заголовок → описание (решение владельца 29.09, #58) */
    val sheetTitleGap = YeetSpace.s16
    /** Заголовок компактной шапки: Body полужирным (у Body один вес, #217) */
    val headerCompactWeight = FontWeight(600)
    /** Низ стопки образов без таб-бара («Удиви меня»): нижнее превью заходит на 3 в поле экрана (1371:42686) */
    val outfitPagerEnd = -3.dp
    /** Низ стопки образов над таб-баром (главная): 29 до таб-бара = поле 24 + 5 (1371:36589) */
    val outfitPagerEndTabBar = 5.dp
}

/** Цвет вещи — атрибут одежды, не интерфейс. */
enum class YeetItemColor(val color: Color, val title: String, /** Буква / иконка на этом цвете (≥ 4.5 : 1) */ val onColor: Color) {
    BLACK(Color(0xFF1A1A2E), "Черный", Color(0xFFFFFFFF)),
    GREY(Color(0xFF777777), "Серый", Color(0xFF000000)),
    WHITE(Color(0xFFFFFFFF), "Белый", Color(0xFF000000)),
    PURPLE(Color(0xFF6A00FF), "Фиолетовый", Color(0xFFFFFFFF)),
    PINK(Color(0xFFD900FF), "Розовый", Color(0xFF000000)),
    GREEN(Color(0xFF00D08B), "Зеленый", Color(0xFF000000)),
    BLUE(Color(0xFF0100F4), "Синий", Color(0xFFFFFFFF)),
    YELLOW(Color(0xFFFFD000), "Желтый", Color(0xFF000000)),
    ORANGE(Color(0xFFFF8800), "Оранжевый", Color(0xFF000000)),
    RED(Color(0xFFFF4230), "Красный", Color(0xFF000000)),
    BEIGE(Color(0xFFFFE1C7), "Бежевый", Color(0xFF000000)),
    BROWN(Color(0xFFC26547), "Коричневый", Color(0xFF000000)),
}

object YeetSpace {
    val s0 = 0.dp
    val s2 = 2.dp
    val s4 = 4.dp
    val s8 = 8.dp
    val s12 = 12.dp
    val s16 = 16.dp
    val s20 = 20.dp
    val s24 = 24.dp
    val s28 = 28.dp
    val s32 = 32.dp
    val s40 = 40.dp
    val s44 = 44.dp
    val s48 = 48.dp
    val s52 = 52.dp
    val s56 = 56.dp
    val screenGutter = 20.dp
}

object YeetRadius {
    /** Острый угол карточки погоды */
    val r8 = 8.dp
    /** Хэндл sheet */
    val xs = 4.dp
    /** Badge */
    val sm = 12.dp
    /** Snackbar, cap столбца графика */
    val md = 16.dp
    /** Карточки, поля, фото */
    val lg = 20.dp
    /** Кнопки-капсулы, верх sheet, подсказка стилиста */
    val xl = 32.dp
    /** Tab-bar и док: отступ 8, концентрично углу экрана 56 (шторки — radius.overlay, #217) */
    val bar = 48.dp
    /** Аватар, радио */
    val full = 999.dp
    /** Все 4 угла bottom sheet и dialog: концентрично экрану 56 при отступе 16 (#217) */
    val overlay = 40.dp
}

/** Базовый экран макетов (iPhone 15/16), боковые поля. */
object YeetLayout {
    val screenWidth = 393.dp
    val screenHeight = 852.dp
    val screenGutter = 20.dp
    val statusBarHeight = 62.dp
}

/** Семейство из переменного шрифта (Google Fonts): по одному Font на каждый нужный вес. */
@OptIn(ExperimentalTextApi::class)
fun yeetFontFamily(@FontRes res: Int, vararg weights: Int) = FontFamily(
    weights.map { Font(res, FontWeight(it), variationSettings = FontVariation.Settings(FontVariation.weight(it))) }
)

/** Шрифты: res/font/roboto_slab_variable.ttf ← tokens/fonts/RobotoSlab-Variable.ttf, res/font/inter_variable.ttf ← tokens/fonts/Inter-Variable.ttf. */
@Immutable
class YeetTypography(val display: FontFamily, val text: FontFamily) {
    /** Заголовки экранов */
    val h1 = TextStyle(fontFamily = display, fontWeight = FontWeight(380), fontSize = 32.sp, lineHeight = 36.sp, letterSpacing = (-1).sp)
    /** Секции, пустые состояния, числа */
    val h2 = TextStyle(fontFamily = display, fontWeight = FontWeight(400), fontSize = 24.sp, lineHeight = 28.sp, letterSpacing = (-0.4).sp)
    /** Заголовки sheet, диалогов, карточек */
    val h3 = TextStyle(fontFamily = display, fontWeight = FontWeight(400), fontSize = 19.sp, lineHeight = 24.sp, letterSpacing = (-0.3).sp)
    /** Текст, кнопки, пункты списков */
    val body = TextStyle(fontFamily = text, fontWeight = FontWeight(460), fontSize = 14.sp, lineHeight = 20.sp, letterSpacing = (0).sp)
    /** Подписи, мета-данные, бейджи */
    val caption = TextStyle(fontFamily = text, fontWeight = FontWeight(400), fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = (0).sp)

    companion object {
        /** YeetTypography.fromResources(R.font.roboto_slab_variable, R.font.inter_variable) */
        fun fromResources(@FontRes display: Int, @FontRes text: Int) = YeetTypography(
            display = yeetFontFamily(display, 380, 400),
            text = yeetFontFamily(text, 400, 460),
        )
    }
}

object YeetDuration {
    const val ms300 = 300
    const val fast = 150
    const val base = 240
}

object YeetEasing {
    val standard = CubicBezierEasing(0.2f, 0f, 0f, 1f)
    val out = CubicBezierEasing(0f, 0f, 0.58f, 1f)
}

/** Пружины Figma Smart Animate (mass 1): stiffness и доля затухания для spring(). */
object YeetSpring {
    /** Figma Gentle: k 100, c 15, ~1022 мс */
    const val gentleDampingRatio = 0.75f
    const val gentleStiffness = 100f
    /** Figma Quick: k 300, c 20, ~744 мс */
    const val quickDampingRatio = 0.5774f
    const val quickStiffness = 300f
    /** Figma Bouncy: k 600, c 15, ~958 мс */
    const val bouncyDampingRatio = 0.3062f
    const val bouncyStiffness = 600f
    /** Не пресет Figma: жёсткость quick (300), damping 2·√300 — ζ = 1, x = 1 − (1 + ωt)·e^−ωt; 540 мс — до 0,1 % от цели (D5, #58): k 300, c 34.641, ~540 мс */
    const val criticalDampingRatio = 1f
    const val criticalStiffness = 300f
}

object YeetMotion {
    /** Нажатие кнопки, scale 0.97 */
    fun <T> press(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = YeetEasing.standard)
    /** Затухание краёв при скролле, затемнение под шторкой, подписи и тени */
    fun <T> fade(): FiniteAnimationSpec<T> = tween(durationMillis = 240, easing = YeetEasing.standard)
    /** Шапка «назад»: компактный заголовок при скролле */
    fun <T> collapse(): FiniteAnimationSpec<T> = tween(durationMillis = 300, easing = YeetEasing.out)
    /** Листание образов и поводов по свайпу */
    fun <T> page(): FiniteAnimationSpec<T> = tween(durationMillis = 300, easing = YeetEasing.out)
    /** Таб-бар уступает место FAB, «+» выезжает справа · Figma Smart Animate Quick */
    fun <T> nav(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.quickDampingRatio, stiffness = YeetSpring.quickStiffness)
    /** Штамп «Надеть» → отмечено · Figma Smart Animate Bouncy */
    fun <T> stamp(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.bouncyDampingRatio, stiffness = YeetSpring.bouncyStiffness)
    /** Смена образа: превью ↔ коллаж · Figma Smart Animate Gentle */
    fun <T> swap(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.gentleDampingRatio, stiffness = YeetSpring.gentleStiffness)
    /** Выбор: фон чипса, вкладки, строки, цвет лайка */
    fun <T> select(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = YeetEasing.standard)
    /** Подъём под пальцем: вещь на холсте, карточка при перетаскивании · Figma Smart Animate Quick */
    fun <T> lift(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.quickDampingRatio, stiffness = YeetSpring.quickStiffness)
    /** Бросок в цель: вещь встаёт на место, соседи раздвигаются · Figma Smart Animate Quick */
    fun <T> drop(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.quickDampingRatio, stiffness = YeetSpring.quickStiffness)
    /** Отмена перетаскивания: вещь возвращается туда, откуда взяли · Figma Smart Animate Gentle */
    fun <T> `return`(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.gentleDampingRatio, stiffness = YeetSpring.gentleStiffness)
    /** Появление: snackbar, подсказка, диалог */
    fun <T> appear(): FiniteAnimationSpec<T> = tween(durationMillis = 240, easing = YeetEasing.standard)
    /** Исчезновение: быстрее появления, чтобы не мешать */
    fun <T> exit(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = YeetEasing.standard)
    /** Шторка: появление, возврат после смахивания, доводка шторки деталей; без перелёта · Не пресет Figma: жёсткость quick (300), damping 2·√300 — ζ = 1, x = 1 − (1 + ωt)·e^−ωt; 540 мс — до 0,1 % от цели (D5, #58) */
    fun <T> sheet(): FiniteAnimationSpec<T> = spring(dampingRatio = YeetSpring.criticalDampingRatio, stiffness = YeetSpring.criticalStiffness)
}

/**
 * Переходы с учётом «уменьшить движение» (web: prefers-reduced-motion; Android: animator duration scale = 0).
 * `reduced` — все переходы мгновенные, подъём и цель без увеличения.
 */
@Immutable
class YeetMotionScheme(val reduced: Boolean = false) {
    /** Нажатие кнопки, scale 0.97 */
    fun <T> press(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.press()
    /** Затухание краёв при скролле, затемнение под шторкой, подписи и тени */
    fun <T> fade(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.fade()
    /** Шапка «назад»: компактный заголовок при скролле */
    fun <T> collapse(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.collapse()
    /** Листание образов и поводов по свайпу */
    fun <T> page(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.page()
    /** Таб-бар уступает место FAB, «+» выезжает справа */
    fun <T> nav(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.nav()
    /** Штамп «Надеть» → отмечено */
    fun <T> stamp(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.stamp()
    /** Смена образа: превью ↔ коллаж */
    fun <T> swap(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.swap()
    /** Выбор: фон чипса, вкладки, строки, цвет лайка */
    fun <T> select(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.select()
    /** Подъём под пальцем: вещь на холсте, карточка при перетаскивании */
    fun <T> lift(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.lift()
    /** Бросок в цель: вещь встаёт на место, соседи раздвигаются */
    fun <T> drop(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.drop()
    /** Отмена перетаскивания: вещь возвращается туда, откуда взяли */
    fun <T> `return`(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.`return`()
    /** Появление: snackbar, подсказка, диалог */
    fun <T> appear(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.appear()
    /** Исчезновение: быстрее появления, чтобы не мешать */
    fun <T> exit(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.exit()
    /** Шторка: появление, возврат после смахивания, доводка шторки деталей; без перелёта */
    fun <T> sheet(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.sheet()
    val liftScale: Float get() = if (reduced) 1f else YeetGesture.liftScale
    val targetScale: Float get() = if (reduced) 1f else YeetGesture.targetScale
}

/** Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации). */
object YeetGesture {
    /** Нажатие кнопки, чипса, иконки */
    const val pressScale = 0.97f
    /** Нажатие карточки: чем больше объект, тем меньше сжатие */
    const val pressScaleCard = 0.98f
    /** Нажатие штампа */
    const val pressScaleStamp = 0.94f
    /** Поднятый предмет при перетаскивании */
    const val liftScale = 1.04f
    /** Цель под перетаскиваемым предметом */
    const val targetScale = 1.02f
    /** Долгое нажатие до подъёма (перетаскивание в сетке) */
    const val longPressMillis = 400L
    /** Задержка нажатого состояния внутри скролла, чтобы скролл не мигал кнопками */
    const val pressDelayMillis = 80L
    /** Сдвиг пальца, после которого нажатие отменяется и начинается жест */
    val touchSlop = 10.dp
    /** Доля ширины: свайп дальше — страница перелистывается */
    const val swipeDistance = 0.3f
    /** Скорость броска, после которой свайп засчитан при любой дистанции (dp/с) */
    const val swipeVelocity = 500f
    /** Сопротивление за границей: скролл, масштаб 40–300 на холсте */
    const val rubberBand = 0.55f
    /** Время показа snackbar без действия (с действием — 6000) */
    const val snackbarMillis = 4000L
    /** Время показа snackbar с действием */
    const val snackbarActionMillis = 6000L
    /** Зона у края скролла, где перетаскиваемая вещь прокручивает экран (перестановка в сетке) */
    val autoscrollEdge = 64.dp
    /** Скорость автоскролла в самом краю зоны; к границе зоны падает до 0 */
    const val autoscrollSpeed = 12f
    /** Оборот индикатора загрузки (кнопка, LoadingState), linear по кругу */
    const val spinMillis = 1200L
    /** Пульсация прозрачности вместо вращения при «Уменьшении движения» */
    const val pulseMillis = 1600L
    /** Проход блика по площадке фото при удалении фона */
    const val shimmerMillis = 1600L
    /** Задержка появления подписи загрузки: на быстрых операциях она не мигает */
    const val loadingDelayMillis = 120L
    /** Погода на главной проявляется после коллажа */
    const val weatherDelayMillis = 160L
}

/** Хаптика: вызывать при смене состояния, не на каждое касание. view.yeetHaptic(YeetHaptic.drop); в Compose — LocalView.current. */
object YeetHaptic {
    /** Смена выбора: чипс, сегмент, вкладка, радио, шаг слайдера цены. Каждый шаг — один тик, не чаще 1 раза в 50 мс */
    val select: Int get() = HapticFeedbackConstants.CLOCK_TICK
    /** Переключатель, лайк, галочка вещи в режиме выбора. И при включении, и при выключении */
    val toggle: Int get() = HapticFeedbackConstants.CONTEXT_CLICK
    /** Подъём: долгое нажатие сработало, вещь на холсте взята. В момент подъёма, одновременно с scale 1.04 */
    val lift: Int get() = HapticFeedbackConstants.LONG_PRESS
    /** Перетаскиваемая вещь зашла на новую цель или корзину. Только при входе в цель, не при движении внутри */
    val target: Int get() = HapticFeedbackConstants.CLOCK_TICK
    /** Бросок в цель: вещь встала на место. На отпускании пальца */
    val drop: Int get() = if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.VIRTUAL_KEY
    /** Жест перешёл порог: свайп перелистнёт, sheet закроется, pull-to-refresh, масштаб упёрся в 40 / 300 %. Один раз при пересечении порога; обратно — без вибрации */
    val threshold: Int get() = if (Build.VERSION.SDK_INT >= 34) HapticFeedbackConstants.GESTURE_THRESHOLD_ACTIVATE else HapticFeedbackConstants.CLOCK_TICK
    /** Штамп «Надеть» — образ отмечен. В пик пружины bouncy (~120 мс после нажатия) */
    val stamp: Int get() = if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.LONG_PRESS
    /** «Не нравится» (малый штамп), смена образа свайпом. На нажатии штампа или при перелистывании образа */
    val skip: Int get() = HapticFeedbackConstants.CONTEXT_CLICK
    /** Вещь брошена в корзину, подтверждено удаление. На отпускании над корзиной */
    val delete: Int get() = if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.REJECT else HapticFeedbackConstants.LONG_PRESS
    /** Ошибка: неверный пароль, не загрузилось фото. Вместе с появлением текста ошибки */
    val error: Int get() = if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.REJECT else HapticFeedbackConstants.LONG_PRESS
    /** Долгая операция завершилась по действию пользователя: вещь распознана, образ сохранён. Не для фоновых событий */
    val success: Int get() = if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.VIRTUAL_KEY
}

fun View.yeetHaptic(type: Int): Boolean = performHapticFeedback(type)

/** Событие хаптики (tokens.motion.haptic) — для YeetTheme.haptics.perform(...). */
enum class YeetHapticEvent(val ios: String) {
    /** Смена выбора: чипс, сегмент, вкладка, радио, шаг слайдера цены */
    Select("selection"),
    /** Переключатель, лайк, галочка вещи в режиме выбора */
    Toggle("impact:light"),
    /** Подъём: долгое нажатие сработало, вещь на холсте взята */
    Lift("impact:medium"),
    /** Перетаскиваемая вещь зашла на новую цель или корзину */
    Target("selection"),
    /** Бросок в цель: вещь встала на место */
    Drop("impact:light"),
    /** Жест перешёл порог: свайп перелистнёт, sheet закроется, pull-to-refresh, масштаб упёрся в 40 / 300 % */
    Threshold("impact:rigid"),
    /** Штамп «Надеть» — образ отмечен */
    Stamp("notification:success"),
    /** «Не нравится» (малый штамп), смена образа свайпом */
    Skip("impact:soft"),
    /** Вещь брошена в корзину, подтверждено удаление */
    Delete("notification:warning"),
    /** Ошибка: неверный пароль, не загрузилось фото */
    Error("notification:error"),
    /** Долгая операция завершилась по действию пользователя: вещь распознана, образ сохранён */
    Success("notification:success"),
    ;

    /** HapticFeedbackConstants с запасным вариантом для старых API (androidMin / androidFallback). */
    val feedbackConstant: Int
        get() = when (this) {
            Select -> YeetHaptic.select
            Toggle -> YeetHaptic.toggle
            Lift -> YeetHaptic.lift
            Target -> YeetHaptic.target
            Drop -> YeetHaptic.drop
            Threshold -> YeetHaptic.threshold
            Stamp -> YeetHaptic.stamp
            Skip -> YeetHaptic.skip
            Delete -> YeetHaptic.delete
            Error -> YeetHaptic.error
            Success -> YeetHaptic.success
        }
}

/** Tab-bar, FAB, hint, панель sheet. Figma: стиль shadow/floating, цвет — переменная ui-colors/shadow: y 8, blur 40. В Compose — Modifier.yeetFloatingShadow() из модуля native/android (или Modifier.shadow(elevation = 10.dp)). */
object YeetShadow {
    val floatingLight = Color(0x1F000000)
    val floatingDark = Color(0x80000000)
    val floatingElevation = 10.dp
    val floatingOffsetX = 0.dp
    val floatingOffsetY = 8.dp
    /** Размытие как в CSS / Figma (blur radius). */
    val floatingBlur = 40.dp
}

/** Прозрачность состояний элемента целиком (не цвета: прозрачные цвета — в color.*). */
object YeetOpacity {
    /** Недоступная кнопка, иконка, стрелка пейджера */
    const val disabled = 0.4f
    /** Нажатая строка списка */
    const val pressed = 0.64f
}

/** Слои (z-index) внутри экрана: чем выше, тем ближе к пользователю. Web — z-index, iOS — .zIndex, Android — Modifier.zIndex. */
object YeetLayer {
    /** Подложка: медиа под сворачивающейся шапкой */
    const val base = 0f
    /** Над соседями: вкладка таб-бара, подпись коллажа, текущий образ */
    const val raised = 1f
    /** Поверх контента: погода и штамп на «Сегодня», подсказка кропа, перетаскиваемая вещь */
    const val float = 2f
    /** Шапка, таб-бар, нижняя панель, стрелки пейджера */
    const val bar = 3f
    /** Плавающие и прилипающие элементы экрана, штамп в деталях */
    const val sticky = 4f
    /** Затемнение и модальные sheet / dialog */
    const val overlay = 5f
}

object YeetSize {
    /** S: чипсы, компактные кнопки, свёрнутая шапка */
    val controlS = 40.dp
    /** M: поле ввода в панели, заголовок-чипс, сегмент M */
    val controlM = 48.dp
    /** L: snackbar, чат, строка списка без группы */
    val controlL = 52.dp
    /** XL: главная кнопка, поле, таб-бар, строка в группе */
    val controlXl = 56.dp
}

/** Цвет кольца */
val YeetColorScheme.focusRingColor: Color get() = textAccent
/** Кольцо фокуса клавиатуры (:focus-visible). Цвет — text-accent: держит ≥ 3 : 1 во всех брендах, accent в светлых брендах падает до 1.4 : 1. */
object YeetFocusRing {
    /** Толщина outline */
    val width = 2.dp
    /** Толщина outline при повышенном контрасте (YeetTheme.isHighContrast) */
    val widthHighContrast = 3.dp
    /** Отступ снаружи: кнопки, чипсы, ссылки */
    val offset = 2.dp
    /** Кольцо внутри: элемент у края экрана или внутри карточки */
    val offsetInset = -2.dp
}

/** Толщина линий: обводки, разделители, кольца. */
object YeetBorderWidth {
    /** Разделители, обводка свотча, волосяная рамка кропа */
    val thin = 1.dp
    /** Линия иконок ui-icons (24 × 24) и кольцо аватара в таб-баре */
    val icon = 1.3.dp
    /** Кольцо фокуса поля ввода, выделение вещи на холсте */
    val medium = 1.5.dp
    /** Уголки кропа, кольцо стопки аватаров, цель перетаскивания */
    val thick = 2.dp
}

/** Ширины, под которые проверяется вёрстка. CSS-переменные нельзя подставить в @media / @container — значения для сверки и JS (matchMedia). */
object YeetBreakpoint {
    /** Контейнер таб-бара (CSS @container): уже — на экране 320 с кнопкой «+» вкладки идут без зазора */
    val containerCompact = 300.dp
    /** Самый узкий экран (iPhone SE) */
    val compact = 320.dp
    /** Базовый экран макетов (iPhone 15/16) */
    val regular = 393.dp
    /** Широкий экран (Pro Max) */
    val large = 430.dp
}
