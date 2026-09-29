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
    /** Фон выбранного чипса (Soft) и сообщения пользователя. Light — сплошной #F1F4FF, как во флоу New app design (не прозрачный: на сером фоне не темнеет) · Figma ui-colors/blue-10% */
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
)

/** Бренд-варианты: переопределяют семантические цвета поверх светлой / тёмной темы (web: data-brand). */
enum class YeetBrand(val title: String, val light: YeetColorScheme, val dark: YeetColorScheme) {
    /** Пример замены синего: лаймовый трикотаж, крем, тёплый чёрный, как на фэшн-референсе. Акцент светлый, поэтому текст на нём тёмный; акцентный текст — оливковый. */
    Lime(
        title = "Лайм",
        light = YeetLightColors.copy(bgCanvas = Color(0xFFFBF8F1), bgElevated = Color(0xFFFFFDF8), bgSubtle = Color(0xFFF1EBDD), bgInverse = Color(0xFF1C1B17), textPrimary = Color(0xFF1C1B17), textSecondary = Color(0xFF6B665C), textInverse = Color(0xFFFBF8F1), textOnAccent = Color(0xFF1C1B17), textAccent = Color(0xFF4F5A12), accent = Color(0xFFC9DE5B), accentSoft = Color(0x59C9DE5B), borderSubtle = Color(0x1A1C1B17), divider = Color(0x0F1C1B17), patternDot = Color(0x331C1B17)),
        dark = YeetDarkColors.copy(bgCanvas = Color(0xFF12110E), bgElevated = Color(0xFF1C1B17), bgSubtle = Color(0xFF27251F), bgInverse = Color(0xFFF4EDDC), textPrimary = Color(0xFFF4EDDC), textSecondary = Color(0xFFA8A18F), textInverse = Color(0xFF12110E), textOnAccent = Color(0xFF1C1B17), textAccent = Color(0xFFD4E86A), accent = Color(0xFFD4E86A), accentSoft = Color(0x29D4E86A), borderSubtle = Color(0x1FF4EDDC), divider = Color(0x14F4EDDC), patternDot = Color(0x33F4EDDC)),
    ),
    /** Сливочно-жёлтый фон с фэшн-референса, шоколадный текст и тёплый крем: акцент светлый, поэтому текст на нём шоколадный, а акцентный текст — карамельно-коричневый. */
    Butter(
        title = "Масло и шоколад",
        light = YeetLightColors.copy(bgCanvas = Color(0xFFFFF9EA), bgElevated = Color(0xFFFFFDF5), bgSubtle = Color(0xFFF6ECD2), bgInverse = Color(0xFF3B2418), textPrimary = Color(0xFF2E1C12), textSecondary = Color(0xFF6E5A4A), textInverse = Color(0xFFFFF9EA), textOnAccent = Color(0xFF2E1C12), textAccent = Color(0xFF7A5200), accent = Color(0xFFF5D86B), accentSoft = Color(0x66F5D86B), borderSubtle = Color(0x1A2E1C12), divider = Color(0x0F2E1C12), patternDot = Color(0x332E1C12)),
        dark = YeetDarkColors.copy(bgCanvas = Color(0xFF17110C), bgElevated = Color(0xFF211910), bgSubtle = Color(0xFF2D2218), bgInverse = Color(0xFFF8EBC8), textPrimary = Color(0xFFF8EBC8), textSecondary = Color(0xFFB3A28A), textInverse = Color(0xFF17110C), textOnAccent = Color(0xFF2E1C12), textAccent = Color(0xFFF5D86B), accent = Color(0xFFF5D86B), accentSoft = Color(0x29F5D86B), borderSubtle = Color(0x1FF8EBC8), divider = Color(0x14F8EBC8), patternDot = Color(0x33F8EBC8)),
    ),
    /** Глубокая вишня и бордо на пудрово-розовом креме: акцент тёмный, поэтому текст на нём белый. */
    Cherry(
        title = "Вишня",
        light = YeetLightColors.copy(bgCanvas = Color(0xFFFFF7F6), bgElevated = Color(0xFFFFFCFB), bgSubtle = Color(0xFFF8E6E4), bgInverse = Color(0xFF2A0E13), textPrimary = Color(0xFF2A0E13), textSecondary = Color(0xFF74595C), textInverse = Color(0xFFFFF7F6), textOnAccent = Color(0xFFFFFFFF), textAccent = Color(0xFF8E1B2E), accent = Color(0xFF9B1B30), accentSoft = Color(0x1A9B1B30), borderSubtle = Color(0x1A2A0E13), divider = Color(0x0F2A0E13), patternDot = Color(0x332A0E13)),
        dark = YeetDarkColors.copy(bgCanvas = Color(0xFF150A0C), bgElevated = Color(0xFF1F1114), bgSubtle = Color(0xFF2B191D), bgInverse = Color(0xFFF8E6E4), textPrimary = Color(0xFFF8E6E4), textSecondary = Color(0xFFB39A9D), textInverse = Color(0xFF150A0C), textOnAccent = Color(0xFFFFFFFF), textAccent = Color(0xFFF2A0AC), accent = Color(0xFFB3243C), accentSoft = Color(0x3DB3243C), borderSubtle = Color(0x1FF8E6E4), divider = Color(0x14F8E6E4), patternDot = Color(0x33F8E6E4)),
    ),
    /** Приглушённый шалфей, экрю и камень, угольный текст: акцент светлый, поэтому текст на нём тёмный, а акцентный текст — глубокий зелёный. */
    Sage(
        title = "Шалфей",
        light = YeetLightColors.copy(bgCanvas = Color(0xFFF7F5EE), bgElevated = Color(0xFFFCFBF7), bgSubtle = Color(0xFFECE9DE), bgInverse = Color(0xFF2B2D29), textPrimary = Color(0xFF23251F), textSecondary = Color(0xFF63665C), textInverse = Color(0xFFF7F5EE), textOnAccent = Color(0xFF23251F), textAccent = Color(0xFF3F5A3E), accent = Color(0xFF9DB293), accentSoft = Color(0x4D9DB293), borderSubtle = Color(0x1A23251F), divider = Color(0x0F23251F), patternDot = Color(0x3323251F)),
        dark = YeetDarkColors.copy(bgCanvas = Color(0xFF111310), bgElevated = Color(0xFF1A1C18), bgSubtle = Color(0xFF252822), bgInverse = Color(0xFFECE9DE), textPrimary = Color(0xFFECE9DE), textSecondary = Color(0xFFA0A396), textInverse = Color(0xFF111310), textOnAccent = Color(0xFF1A1C18), textAccent = Color(0xFFB5C9AA), accent = Color(0xFFA9BF9E), accentSoft = Color(0x29A9BF9E), borderSubtle = Color(0x1FECE9DE), divider = Color(0x14ECE9DE), patternDot = Color(0x33ECE9DE)),
    ),
    /** Нежная лаванда, холодные светлые поверхности и графитовый текст: акцент светлый, поэтому текст на нём графитовый, а акцентный текст — насыщенный фиолетовый. */
    Lilac(
        title = "Лаванда",
        light = YeetLightColors.copy(bgCanvas = Color(0xFFF8F7FC), bgElevated = Color(0xFFFFFFFF), bgSubtle = Color(0xFFEEECF6), bgInverse = Color(0xFF26252C), textPrimary = Color(0xFF26252C), textSecondary = Color(0xFF65636F), textInverse = Color(0xFFF8F7FC), textOnAccent = Color(0xFF26252C), textAccent = Color(0xFF5B4A9A), accent = Color(0xFFC8B8F0), accentSoft = Color(0x59C8B8F0), borderSubtle = Color(0x1A26252C), divider = Color(0x0F26252C), patternDot = Color(0x3326252C)),
        dark = YeetDarkColors.copy(bgCanvas = Color(0xFF100F14), bgElevated = Color(0xFF1A1920), bgSubtle = Color(0xFF25232C), bgInverse = Color(0xFFEEECF6), textPrimary = Color(0xFFEEECF6), textSecondary = Color(0xFFA19FAD), textInverse = Color(0xFF100F14), textOnAccent = Color(0xFF26252C), textAccent = Color(0xFFC8B8F0), accent = Color(0xFFC8B8F0), accentSoft = Color(0x2EC8B8F0), borderSubtle = Color(0x1FEEECF6), divider = Color(0x14EEECF6), patternDot = Color(0x33EEECF6)),
    ),
}

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
    val sheetRadiusBottom = YeetRadius.bar
    /** Верх высокой шторки: 8 под статус-баром (D2). Web — статус-бар + 8, натив — 8 от safe area top */
    val sheetTopGap = YeetSpace.s8
    /** Заголовок → контент и заголовок → описание (решение владельца 29.09, #58) */
    val sheetTitleGap = YeetSpace.s16
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
    val s48 = 48.dp
    val s52 = 52.dp
    val s56 = 56.dp
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
    /** Все 4 угла bottom sheet и dialog: концентрично экрану 56 при отступе 8 (#58) */
    val overlay = 48.dp
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
}

object YeetMotion {
    /** Нажатие кнопки, scale 0.97 */
    fun <T> press(): FiniteAnimationSpec<T> = tween(durationMillis = 150, easing = YeetEasing.standard)
    /** Затухание краёв, тосты */
    fun <T> fade(): FiniteAnimationSpec<T> = tween(durationMillis = 240, easing = YeetEasing.standard)
    /** Фото сворачивается в шапку при скролле */
    fun <T> collapse(): FiniteAnimationSpec<T> = tween(durationMillis = 300, easing = YeetEasing.out)
    /** Листание образов и поводов по свайпу */
    fun <T> page(): FiniteAnimationSpec<T> = tween(durationMillis = 300, easing = YeetEasing.out)
    /** Таб-бар уступает место FAB · Figma Smart Animate Quick */
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
}

/**
 * Переходы с учётом «уменьшить движение» (web: prefers-reduced-motion; Android: animator duration scale = 0).
 * `reduced` — все переходы мгновенные, подъём и цель без увеличения.
 */
@Immutable
class YeetMotionScheme(val reduced: Boolean = false) {
    /** Нажатие кнопки, scale 0.97 */
    fun <T> press(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.press()
    /** Затухание краёв, тосты */
    fun <T> fade(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.fade()
    /** Фото сворачивается в шапку при скролле */
    fun <T> collapse(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.collapse()
    /** Листание образов и поводов по свайпу */
    fun <T> page(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.page()
    /** Таб-бар уступает место FAB */
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
