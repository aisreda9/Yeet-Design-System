package design.yeet.ds.molecules

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import design.yeet.ds.atoms.Button
import design.yeet.ds.atoms.ButtonStyle
import design.yeet.ds.atoms.ControlSize
import design.yeet.ds.atoms.Icon
import design.yeet.ds.atoms.Text
import design.yeet.ds.atoms.TextTone
import design.yeet.ds.atoms.TextVariant
import design.yeet.ds.icons.IconName
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.ds.theme.yeetFloatingShadow

/* ─── Hint ──────────────────────────────────────────────────────────── */

/** Подсказка поверх холста или фото: пилюля `bgElevated` с тенью, иконка 16 + Caption. */
@Composable
fun Hint(text: String, modifier: Modifier = Modifier, icon: IconName = IconName.FingersPinch) {
    val c = YeetTheme.colors
    val shape = RoundedCornerShape(YeetTheme.radius.xl)
    Row(
        modifier
            .yeetFloatingShadow(shape)
            .background(c.bgElevated, shape)
            .padding(start = 8.dp, end = 12.dp, top = 4.dp, bottom = 4.dp)
            .semantics(mergeDescendants = true) { },
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, size = 16.dp, tint = c.textPrimary)
        Text(text, variant = TextVariant.Caption, tone = TextTone.Primary)
    }
}

/* ─── Snackbar ──────────────────────────────────────────────────────── */

/**
 * Тост-подтверждение над нижней навигацией: инвертированный фон, 52, радиус 12, появление снизу (`appear`).
 * Время показа — `YeetGesture.snackbarMillis` (4 с; с действием — 6 с), скрывает вызывающий код.
 *
 * @param onUndo «Отменить» — изогнутая стрелка справа (флоу: «Вещь перемещена в архив»).
 */
@Composable
fun Snackbar(
    text: String,
    modifier: Modifier = Modifier,
    onClose: (() -> Unit)? = null,
    onUndo: (() -> Unit)? = null,
) {
    val c = YeetTheme.colors
    val motion = YeetTheme.motion
    val shift = with(LocalDensity.current) { 16.dp.toPx() }
    val appear = remember { Animatable(0f) }
    LaunchedEffect(Unit) { appear.animateTo(1f, motion.appear()) }
    Row(
        modifier
            .fillMaxWidth()
            .graphicsLayer {
                alpha = appear.value
                translationY = (1f - appear.value) * shift
            }
            .heightIn(min = 52.dp)
            .background(c.bgInverse, RoundedCornerShape(YeetTheme.radius.sm))
            .padding(horizontal = 20.dp)
            .semantics { liveRegion = LiveRegionMode.Polite },
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        CompositionLocalProvider(LocalContentColor provides c.textInverse) {
            Text(text, modifier = Modifier.weight(1f).padding(vertical = 12.dp))
            if (onUndo != null) SnackbarAction(IconName.Undo, "Отменить", onUndo)
            if (onClose != null) SnackbarAction(IconName.Cross, "Закрыть", onClose)
        }
    }
}

@Composable
private fun SnackbarAction(icon: IconName, label: String, onClick: () -> Unit) {
    // Иконка 24; зона нажатия расширяется до 48 автоматически (minimumTouchTargetSize)
    Box(
        Modifier
            .size(24.dp)
            .clickable(role = Role.Button, onClick = onClick)
            .semantics { contentDescription = label },
    ) { Icon(icon) }
}

/* ─── EmptyState ────────────────────────────────────────────────────── */

/** Кнопка пустого состояния: «Добавить вещь» (Primary), «Сбросить фильтры» (Tertiary, по умолчанию). */
data class EmptyStateAction(val label: String, val variant: ButtonStyle = ButtonStyle.Tertiary, val onClick: (() -> Unit)? = null)

/**
 * Пустое состояние и «ничего не найдено»: заголовок H1, текст Body grey через 16, кнопка L через 32.
 * Ставится по центру свободной области экрана между шапкой и нижней навигацией.
 */
@Composable
fun EmptyState(
    title: String,
    description: String,
    modifier: Modifier = Modifier,
    action: EmptyStateAction? = null,
) {
    Column(
        modifier.widthIn(max = 353.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(title, variant = TextVariant.H1, tone = TextTone.Primary, textAlign = TextAlign.Center)
        Spacer(Modifier.height(16.dp))
        Text(description, tone = TextTone.Secondary, textAlign = TextAlign.Center)
        if (action != null) {
            Spacer(Modifier.height(32.dp))
            Button(action.label, onClick = { action.onClick?.invoke() }, variant = action.variant, size = ControlSize.L)
        }
    }
}

/* ─── LoadingState ──────────────────────────────────────────────────── */

/** Загрузка внутри области: крутящаяся `Spin` (1.2 с, при «уменьшить движение» — стоит) + подпись. */
@Composable
fun LoadingState(label: String, modifier: Modifier = Modifier) {
    val reduced = YeetTheme.motion.reduced
    val rotation = if (reduced) {
        0f
    } else {
        val transition = rememberInfiniteTransition(label = "spin")
        val r by transition.animateFloat(0f, 360f, infiniteRepeatable(tween(1200, easing = LinearEasing), RepeatMode.Restart), label = "spinRotation")
        r
    }
    Column(
        modifier.semantics(mergeDescendants = true) { liveRegion = LiveRegionMode.Polite },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(IconName.Spin, modifier = Modifier.graphicsLayer { rotationZ = rotation })
        Text(label)
    }
}

@YeetPreviews
@Composable
private fun FeedbackPreview() = YeetPreviewSurface {
    Hint("Перемещай и масштабируй вещи")
    Snackbar("Вещь перемещена в архив", onUndo = {}, onClose = {})
    Snackbar("Добавлено в вишлист")
    EmptyState(
        title = "Гардероб пуст",
        description = "Добавь первую вещь — и мы соберём образы",
        action = EmptyStateAction("Добавить вещь", ButtonStyle.Primary),
        modifier = Modifier.fillMaxWidth(),
    )
    LoadingState("Удаляем фон", modifier = Modifier.fillMaxWidth())
}
