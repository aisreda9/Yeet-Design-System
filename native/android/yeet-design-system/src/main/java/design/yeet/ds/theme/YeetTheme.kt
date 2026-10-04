package design.yeet.ds.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Dp
import design.yeet.ds.R
import design.yeet.tokens.YeetColorScheme
import design.yeet.tokens.YeetDarkColors
import design.yeet.tokens.YeetLightColors
import design.yeet.tokens.YeetMotionScheme
import design.yeet.tokens.YeetRadius
import design.yeet.tokens.YeetShadow
import design.yeet.tokens.YeetSpace
import design.yeet.tokens.YeetTypography

/** Эффект-стиль shadow/floating (tokens.shadow.floating) для текущей темы. */
@Immutable
data class YeetShadowStyle(val color: Color, val offsetX: Dp, val offsetY: Dp, val blur: Dp) {
    companion object {
        val Light = YeetShadowStyle(YeetShadow.floatingLight, YeetShadow.floatingOffsetX, YeetShadow.floatingOffsetY, YeetShadow.floatingBlur)
        val Dark = YeetShadowStyle(YeetShadow.floatingDark, YeetShadow.floatingOffsetX, YeetShadow.floatingOffsetY, YeetShadow.floatingBlur)
    }
}

/** Семантические цвета (web: --color-*). Меняются темой и брендом. */
val LocalYeetColors = staticCompositionLocalOf { YeetLightColors }

/** Текстовые стили h1 / h2 / h3 / body / caption. По умолчанию — системные семейства (до YeetTheme). */
val LocalYeetTypography = staticCompositionLocalOf { YeetTypography(display = FontFamily.Serif, text = FontFamily.SansSerif) }

/** Шкала отступов (web: --space-*). */
val LocalYeetSpace = staticCompositionLocalOf { YeetSpace }

/** Скругления (web: --radius-*). */
val LocalYeetRadius = staticCompositionLocalOf { YeetRadius }

/** Тень shadow/floating текущей темы. */
val LocalYeetShadow = staticCompositionLocalOf { YeetShadowStyle.Light }

/** Переходы (web: --motion-*) с учётом «уменьшить движение». */
val LocalYeetMotion = staticCompositionLocalOf { YeetMotionScheme() }

/** Хаптика по событиям tokens.motion.haptic. */
val LocalYeetHaptics = staticCompositionLocalOf { YeetHaptics.None }

/** Тёмная ли тема сейчас. */
val LocalYeetDarkTheme = staticCompositionLocalOf { false }

/**
 * Тема Yeet: цвета light / dark, типографика Roboto Slab + Inter из res/font,
 * отступы, скругления, тень, движение и хаптика. Material3 внутри — только как база
 * (его ColorScheme и Typography собраны из токенов Yeet, чтобы стандартные M3-компоненты не выбивались).
 *
 * @param reduceMotion «Уменьшить движение»: по умолчанию читается из системной настройки
 *   «Убрать анимацию» (animator duration scale = 0).
 * @param hapticsEnabled выключает хаптику компонентов целиком (системная настройка уважается всегда).
 */
@Composable
fun YeetTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    typography: YeetTypography = rememberYeetTypography(),
    reduceMotion: Boolean = rememberReduceMotion(),
    hapticsEnabled: Boolean = true,
    content: @Composable () -> Unit,
) {
    val colors = if (darkTheme) YeetDarkColors else YeetLightColors
    val view = LocalView.current
    val haptics = remember(view, hapticsEnabled) { if (hapticsEnabled) YeetHaptics(view) else YeetHaptics.None }
    val motion = remember(reduceMotion) { YeetMotionScheme(reduced = reduceMotion) }
    val material = remember(colors, darkTheme) { colors.toMaterialColorScheme(darkTheme) }
    val materialTypography = remember(typography) { typography.toMaterialTypography() }

    CompositionLocalProvider(
        LocalYeetColors provides colors,
        LocalYeetTypography provides typography,
        LocalYeetSpace provides YeetSpace,
        LocalYeetRadius provides YeetRadius,
        LocalYeetShadow provides if (darkTheme) YeetShadowStyle.Dark else YeetShadowStyle.Light,
        LocalYeetMotion provides motion,
        LocalYeetHaptics provides haptics,
        LocalYeetDarkTheme provides darkTheme,
    ) {
        MaterialTheme(colorScheme = material, typography = materialTypography) {
            CompositionLocalProvider(LocalContentColor provides colors.textPrimary, content = content)
        }
    }
}

/** Доступ к значениям темы: `YeetTheme.colors.accent`, `YeetTheme.typography.body`, `YeetTheme.motion.press()`. */
object YeetTheme {
    val colors: YeetColorScheme
        @Composable @ReadOnlyComposable get() = LocalYeetColors.current
    val typography: YeetTypography
        @Composable @ReadOnlyComposable get() = LocalYeetTypography.current
    val space: YeetSpace
        @Composable @ReadOnlyComposable get() = LocalYeetSpace.current
    val radius: YeetRadius
        @Composable @ReadOnlyComposable get() = LocalYeetRadius.current
    val shadow: YeetShadowStyle
        @Composable @ReadOnlyComposable get() = LocalYeetShadow.current
    val motion: YeetMotionScheme
        @Composable @ReadOnlyComposable get() = LocalYeetMotion.current
    val haptics: YeetHaptics
        @Composable @ReadOnlyComposable get() = LocalYeetHaptics.current
    val isDark: Boolean
        @Composable @ReadOnlyComposable get() = LocalYeetDarkTheme.current
}

/** Roboto Slab (заголовки) + Inter (текст) из res/font — переменные шрифты tokens/fonts. */
@Composable
fun rememberYeetTypography(): YeetTypography = remember {
    YeetTypography.fromResources(display = R.font.roboto_slab_variable, text = R.font.inter_variable)
}

/** Material3 ColorScheme из семантики Yeet (Figma → Material): accent → primary, bg-subtle → surfaceVariant… */
fun YeetColorScheme.toMaterialColorScheme(dark: Boolean): ColorScheme =
    if (dark) {
        darkColorScheme(
            primary = accent, onPrimary = textOnAccent, primaryContainer = accentSoft, onPrimaryContainer = textAccent,
            secondary = bgInverse, onSecondary = textInverse, secondaryContainer = bgSubtle, onSecondaryContainer = textPrimary,
            tertiary = accent, onTertiary = textOnAccent,
            background = bgCanvas, onBackground = textPrimary, surface = bgElevated, onSurface = textPrimary,
            surfaceVariant = bgSubtle, onSurfaceVariant = textSecondary, inverseSurface = bgInverse, inverseOnSurface = textInverse,
            error = danger, onError = textOnDanger, errorContainer = dangerSoft, onErrorContainer = textDanger,
            outline = borderSubtle, outlineVariant = divider, scrim = bgOverlay,
        )
    } else {
        lightColorScheme(
            primary = accent, onPrimary = textOnAccent, primaryContainer = accentSoft, onPrimaryContainer = textAccent,
            secondary = bgInverse, onSecondary = textInverse, secondaryContainer = bgSubtle, onSecondaryContainer = textPrimary,
            tertiary = accent, onTertiary = textOnAccent,
            background = bgCanvas, onBackground = textPrimary, surface = bgElevated, onSurface = textPrimary,
            surfaceVariant = bgSubtle, onSurfaceVariant = textSecondary, inverseSurface = bgInverse, inverseOnSurface = textInverse,
            error = danger, onError = textOnDanger, errorContainer = dangerSoft, onErrorContainer = textDanger,
            outline = borderSubtle, outlineVariant = divider, scrim = bgOverlay,
        )
    }

/** Material3 Typography из стилей Yeet: display / headline — Roboto Slab, body / label — Inter. */
fun YeetTypography.toMaterialTypography(): Typography = Typography(
    displayLarge = h1, displayMedium = h1, displaySmall = h1,
    headlineLarge = h1, headlineMedium = h2, headlineSmall = h3,
    titleLarge = h3, titleMedium = body, titleSmall = body,
    bodyLarge = body, bodyMedium = body, bodySmall = caption,
    labelLarge = body, labelMedium = caption, labelSmall = caption,
)
