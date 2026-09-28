// Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.
// Jetpack Compose. Схемы light / dark — выбирать по isSystemInDarkTheme().

package design.yeet.tokens

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import android.os.Build
import android.view.HapticFeedbackConstants
import android.view.View
import androidx.annotation.FontRes
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class YeetColorScheme(
    // Поверхности
    /** Фон экрана · Figma ui-colors/white */
    val bgCanvas: Color,
    /** Поднятые поверхности: tab-bar, sheet, dialog, hint · Figma ui-colors/elevated */
    val bgElevated: Color,
    /** Карточки, поля, tertiary-кнопки · Figma ui-colors/light-grey */
    val bgSubtle: Color,
    /** Snackbar, Secondary-кнопка, погода · Figma ui-colors/black */
    val bgInverse: Color,
    /** Затемнение под модальным sheet · Figma ui-colors/overlay */
    val bgOverlay: Color,
    // Контент
    /** Основной текст и иконки · Figma ui-colors/black */
    val textPrimary: Color,
    /** Вторичный текст, лейблы, подписи · Figma ui-colors/grey */
    val textSecondary: Color,
    /** Текст на inverse-поверхности · Figma ui-colors/white */
    val textInverse: Color,
    /** Текст и иконки на accent / danger · Figma ui-colors/on-accent */
    val textOnAccent: Color,
    /** Вторичный текст на inverse-поверхности: подпись в карточке погоды · Figma ui-colors/inverse-secondary */
    val textInverseSecondary: Color,
    /** Текст на danger (бейдж скидки) — белый в любом бренде · Figma ui-colors/white */
    val textOnDanger: Color,
    /** Акцентный текст, выбранное · Figma ui-colors/blue-text */
    val textAccent: Color,
    /** Ошибки, деструктивные действия · Figma ui-colors/red-text */
    val textDanger: Color,
    // Акцент, обратная связь, линии
    /** Главное действие, выбранное, фокус · Figma ui-colors/blue */
    val accent: Color,
    /** Фон выбранного чипса (Soft) · Figma ui-colors/blue-10% */
    val accentSoft: Color,
    /** Удаление, ошибка, бейдж скидки · Figma ui-colors/red */
    val danger: Color,
    /** Фон Destructive-кнопки · Figma ui-colors/red-10% */
    val dangerSoft: Color,
    /** Обводки свотчей, гистограмма, фон неактивных точек · Figma ui-colors/black-10% */
    val borderSubtle: Color,
    /** Разделители строк в input-group и list-group · Figma divider (black @5%) */
    val divider: Color,
    /** Точки фона коллажа и холста (2 px, шаг 10) · Figma pattern (black @23%) */
    val patternDot: Color,
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
    textAccent = Color(0xFF0100F4),
    textDanger = Color(0xFFCC291B),
    accent = Color(0xFF0100F4),
    accentSoft = Color(0xFFF1F4FF),
    danger = Color(0xFFCC291B),
    dangerSoft = Color(0x1AFF4230),
    borderSubtle = Color(0x1A000000),
    divider = Color(0x0D000000),
    patternDot = Color(0x3B000000),
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
    textAccent = Color(0xFF8A8AFF),
    textDanger = Color(0xFFFF6B5C),
    accent = Color(0xFF4B4BFF),
    accentSoft = Color(0x334B4BFF),
    danger = Color(0xFFCC291B),
    dangerSoft = Color(0x2EFF6B5C),
    borderSubtle = Color(0x1FF5F5F7),
    divider = Color(0x14F5F5F7),
    patternDot = Color(0x3BF5F5F7),
)

/** Цвет вещи — атрибут одежды, не интерфейс. */
enum class YeetItemColor(val color: Color, val title: String) {
    BLACK(Color(0xFF1A1A2E), "Черный"),
    GREY(Color(0xFF777777), "Серый"),
    WHITE(Color(0xFFFFFFFF), "Белый"),
    PURPLE(Color(0xFF6A00FF), "Фиолетовый"),
    PINK(Color(0xFFD900FF), "Розовый"),
    GREEN(Color(0xFF00D08B), "Зеленый"),
    BLUE(Color(0xFF0100F4), "Синий"),
    YELLOW(Color(0xFFFFD000), "Желтый"),
    ORANGE(Color(0xFFFF8800), "Оранжевый"),
    RED(Color(0xFFFF4230), "Красный"),
    BEIGE(Color(0xFFFFE1C7), "Бежевый"),
    BROWN(Color(0xFFC26547), "Коричневый"),
}

object YeetSpace {
    val s0 = 0.dp
    val s1 = 1.dp
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
    val s48 = 48.dp
    val s52 = 52.dp
    val s56 = 56.dp
    val s64 = 64.dp
    val s72 = 72.dp
    val screenGutter = 20.dp
}

object YeetRadius {
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
    /** Tab-bar, низ плавающего sheet (концентрично углу экрана) */
    val bar = 48.dp
    /** Аватар, радио */
    val full = 999.dp
}

/** Семейство из переменного шрифта (Google Fonts): по одному Font на каждый нужный вес. */
@OptIn(ExperimentalTextApi::class)
fun yeetFontFamily(@FontRes res: Int, vararg weights: Int) = FontFamily(
    weights.map { Font(res, FontWeight(it), variationSettings = FontVariation.Settings(FontVariation.weight(it))) }
)

/** Шрифты: res/font/roboto_slab_variable.ttf ← tokens/fonts/RobotoSlab-Variable.ttf, res/font/inter_variable.ttf ← tokens/fonts/Inter-Variable.ttf. */
class YeetTypography(display: FontFamily, text: FontFamily) {
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

object YeetMotion {
    /** Нажатие кнопки, scale 0.97 */
    fun <T> press(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))
    /** Затухание краёв, тосты */
    fun <T> fade(): FiniteAnimationSpec<T> = tween(durationMillis = 240, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))
    /** Фото сворачивается в шапку при скролле */
    fun <T> collapse(): FiniteAnimationSpec<T> = tween(durationMillis = 300, easing = CubicBezierEasing(0f, 0f, 0.58f, 1f))
    /** Листание образов и поводов по свайпу */
    fun <T> page(): FiniteAnimationSpec<T> = tween(durationMillis = 300, easing = CubicBezierEasing(0f, 0f, 0.58f, 1f))
    /** Таб-бар уступает место FAB · Figma Smart Animate Quick */
    fun <T> nav(): FiniteAnimationSpec<T> = spring(dampingRatio = 0.5774f, stiffness = 300f)
    /** Штамп «Надеть» → отмечено · Figma Smart Animate Bouncy */
    fun <T> stamp(): FiniteAnimationSpec<T> = spring(dampingRatio = 0.3062f, stiffness = 600f)
    /** Смена образа: превью ↔ коллаж · Figma Smart Animate Gentle */
    fun <T> swap(): FiniteAnimationSpec<T> = spring(dampingRatio = 0.75f, stiffness = 100f)
    /** Выбор: фон чипса, вкладки, строки, цвет лайка */
    fun <T> select(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))
    /** Подъём под пальцем: вещь на холсте, карточка при перетаскивании · Figma Smart Animate Quick */
    fun <T> lift(): FiniteAnimationSpec<T> = spring(dampingRatio = 0.5774f, stiffness = 300f)
    /** Бросок в цель: вещь встаёт на место, соседи раздвигаются · Figma Smart Animate Quick */
    fun <T> drop(): FiniteAnimationSpec<T> = spring(dampingRatio = 0.5774f, stiffness = 300f)
    /** Отмена перетаскивания: вещь возвращается туда, откуда взяли · Figma Smart Animate Gentle */
    fun <T> return(): FiniteAnimationSpec<T> = spring(dampingRatio = 0.75f, stiffness = 100f)
    /** Появление: snackbar, подсказка, диалог */
    fun <T> appear(): FiniteAnimationSpec<T> = tween(durationMillis = 240, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))
    /** Исчезновение: быстрее появления, чтобы не мешать */
    fun <T> exit(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f))
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

/** Tab-bar, FAB, hint, панель sheet: y 8, blur 40. В Compose — Modifier.shadow(elevation = 10.dp, shape, ambientColor / spotColor = цвет ниже). */
object YeetShadow {
    val floatingLight = Color(0x1F000000)
    val floatingDark = Color(0x80000000)
    val floatingElevation = 10.dp
}
