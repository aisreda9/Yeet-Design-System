package design.yeet.ds.atoms

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.ScrollEdgePosition
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetItemColor

/* ─── Text ──────────────────────────────────────────────────────────── */

/** Один из 5 стилей: заголовки — Roboto Slab, остальное — Inter. */
enum class TextVariant { H1, H2, H3, Body, Caption }

/** Цвет текста по роли. */
enum class TextTone { Primary, Secondary, Accent, Danger }

/**
 * Текст в одном из 5 стилей (React: `<Text variant tone>`). Размеры — в sp: растут с системным масштабом шрифта.
 * @param tone `null` — цвет наследуется от LocalContentColor (по умолчанию textPrimary; внутри кнопки — цвет кнопки).
 * @param heading озвучивать как заголовок (по умолчанию — для H1–H3).
 */
@Composable
fun Text(
    text: String,
    modifier: Modifier = Modifier,
    variant: TextVariant = TextVariant.Body,
    tone: TextTone? = null,
    color: Color = Color.Unspecified,
    textAlign: TextAlign = TextAlign.Start,
    maxLines: Int = Int.MAX_VALUE,
    overflow: TextOverflow = TextOverflow.Clip,
    heading: Boolean = variant == TextVariant.H1 || variant == TextVariant.H2 || variant == TextVariant.H3,
) {
    val t = YeetTheme.typography
    val c = YeetTheme.colors
    val style = when (variant) {
        TextVariant.H1 -> t.h1
        TextVariant.H2 -> t.h2
        TextVariant.H3 -> t.h3
        TextVariant.Body -> t.body
        TextVariant.Caption -> t.caption
    }
    val resolved = when {
        color != Color.Unspecified -> color
        tone == TextTone.Primary -> c.textPrimary
        tone == TextTone.Secondary -> c.textSecondary
        tone == TextTone.Accent -> c.textAccent
        tone == TextTone.Danger -> c.textDanger
        else -> LocalContentColor.current
    }
    BasicText(
        text = text,
        modifier = if (heading) modifier.semantics { heading() } else modifier,
        style = style.merge(TextStyle(color = resolved, textAlign = textAlign)),
        maxLines = maxLines,
        overflow = overflow,
    )
}

/* ─── Badge ─────────────────────────────────────────────────────────── */

/** Стиль бейджа (Figma: Style). */
enum class BadgeVariant { Primary, Danger, Secondary, Muted, Tertiary, Ghost }

/** Бейдж высотой 24, паддинг 8, радиус 12, Caption. Скидка на товаре — `Danger`, счётчик — `Secondary`. */
@Composable
fun Badge(
    text: String,
    modifier: Modifier = Modifier,
    variant: BadgeVariant = BadgeVariant.Primary,
) {
    val c = YeetTheme.colors
    val (bg, fg) = when (variant) {
        BadgeVariant.Primary -> c.accent to c.textOnAccent
        BadgeVariant.Danger -> c.danger to c.textOnDanger
        BadgeVariant.Secondary -> c.bgInverse to c.textInverse
        BadgeVariant.Muted -> c.textSecondary to c.bgCanvas
        BadgeVariant.Tertiary -> c.bgSubtle to c.textPrimary
        BadgeVariant.Ghost -> Color.Transparent to c.textPrimary
    }
    Box(
        modifier
            .heightIn(min = 24.dp)
            .background(bg, RoundedCornerShape(YeetTheme.radius.sm))
            .padding(horizontal = 8.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, variant = TextVariant.Caption, color = fg, maxLines = 1)
    }
}

/* ─── Avatar ────────────────────────────────────────────────────────── */

/** L 96 (профиль), M 40 (аккаунты, настройки, чат), S 24. */
enum class AvatarSize(val diameter: Dp) { S(24.dp), M(40.dp), L(96.dp) }

/** Светлые цвета вещей: на них буква тёмная, иначе её не видно. */
private val lightItems = setOf(YeetItemColor.WHITE, YeetItemColor.BEIGE, YeetItemColor.YELLOW)

/**
 * Аватар: фото (заливкой), буква Roboto Slab или иконка камеры (пусто).
 * @param color фон буквы: у каждого аккаунта свой цвет (флоу Profile / Accounts). По умолчанию — акцент.
 * @param alt описание фото для TalkBack.
 */
@Composable
fun Avatar(
    modifier: Modifier = Modifier,
    size: AvatarSize = AvatarSize.M,
    initial: String? = null,
    src: Painter? = null,
    alt: String = "",
    color: YeetItemColor? = null,
) {
    val c = YeetTheme.colors
    val t = YeetTheme.typography
    val bg = when {
        src != null -> c.bgSubtle
        initial != null -> color?.color ?: c.accent
        else -> c.bgSubtle
    }
    val fg = when {
        initial != null && color != null && color in lightItems -> Color.Black
        initial != null -> c.textOnAccent
        else -> c.textPrimary
    }
    Box(
        modifier
            .size(size.diameter)
            .clip(CircleShape)
            .background(bg)
            .then(if (alt.isNotEmpty()) Modifier.semantics { contentDescription = alt } else Modifier),
        contentAlignment = Alignment.Center,
    ) {
        when {
            src != null -> Image(src, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
            initial != null -> {
                val style = when (size) {
                    AvatarSize.L -> t.h1
                    AvatarSize.M -> t.h3
                    AvatarSize.S -> t.caption
                }
                BasicText(initial, style = style.merge(TextStyle(color = fg, textAlign = TextAlign.Center)), maxLines = 1)
            }
            else -> Icon(IconName.Camera, size = if (size == AvatarSize.S) 14.dp else 24.dp, tint = fg)
        }
    }
}

/* ─── Divider ───────────────────────────────────────────────────────── */

/**
 * Линия-разделитель 1 dp `borderSubtle`. С `label` — «— или —» между способами входа (флоу Auth / Sign In).
 */
@Composable
fun Divider(modifier: Modifier = Modifier, label: String? = null) {
    val line = YeetTheme.colors.borderSubtle
    if (label == null) {
        Box(modifier.fillMaxWidth().height(1.dp).background(line))
        return
    }
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.weight(1f).height(1.dp).background(line))
        Text(label, variant = TextVariant.Caption, tone = TextTone.Secondary)
        Box(Modifier.weight(1f).height(1.dp).background(line))
    }
}

/* ─── ColorDot ──────────────────────────────────────────────────────── */

/** Свотч цвета вещи с обводкой border-subtle. Только для атрибута «цвет вещи», не для интерфейса. */
@Composable
fun ColorDot(color: YeetItemColor, modifier: Modifier = Modifier, size: Dp = 12.dp) {
    Box(
        modifier
            .size(size)
            .background(color.color, CircleShape)
            .border(1.dp, YeetTheme.colors.borderSubtle, CircleShape),
    )
}

/* ─── ScrollEdge ────────────────────────────────────────────────────── */

/**
 * Полоса затухания отдельным элементом (web: ScrollEdge). Уже встроена в Header, BottomNav, BottomBar
 * (Modifier.scrollEdgeFade) — отдельно нужна редко. `Top` — от фона вниз к прозрачному, `Bottom` — наоборот.
 */
@Composable
fun ScrollEdge(position: ScrollEdgePosition, modifier: Modifier = Modifier, size: Dp = 24.dp) {
    val canvas = YeetTheme.colors.bgCanvas
    val colors = if (position == ScrollEdgePosition.Top) listOf(canvas, canvas.copy(alpha = 0f)) else listOf(canvas.copy(alpha = 0f), canvas)
    Box(modifier.fillMaxWidth().height(size).background(Brush.verticalGradient(colors)))
}

@YeetPreviews
@Composable
private fun DisplayPreview() = YeetPreviewSurface {
    Text("Гардероб", variant = TextVariant.H1)
    Text("Образы на каждый день", variant = TextVariant.H2, tone = TextTone.Accent)
    Text("Заголовок карточки", variant = TextVariant.H3)
    Text("Основной текст", tone = TextTone.Secondary)
    Text("Подпись", variant = TextVariant.Caption, tone = TextTone.Danger)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        BadgeVariant.entries.forEach { Badge(it.name, variant = it) }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Avatar(size = AvatarSize.L, initial = "С")
        Avatar(size = AvatarSize.M, initial = "Т", color = YeetItemColor.ORANGE)
        Avatar(size = AvatarSize.M, initial = "Б", color = YeetItemColor.BEIGE)
        Avatar(size = AvatarSize.M)
        Avatar(size = AvatarSize.S, initial = "A")
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        YeetItemColor.entries.forEach { ColorDot(it, size = 16.dp) }
    }
    Divider()
    Divider(label = "или")
}
