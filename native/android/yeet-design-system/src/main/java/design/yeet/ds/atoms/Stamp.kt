package design.yeet.ds.atoms

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import design.yeet.ds.icons.IconName
import design.yeet.ds.icons.YeetStampStarVector
import design.yeet.ds.theme.YeetPreviewSurface
import design.yeet.ds.theme.YeetPreviews
import design.yeet.ds.theme.YeetTheme
import design.yeet.tokens.YeetGesture
import design.yeet.tokens.YeetHapticEvent
import design.yeet.tokens.buttonPrimaryBg
import design.yeet.tokens.buttonPrimaryFg
import design.yeet.tokens.buttonSecondaryBg
import design.yeet.tokens.buttonSecondaryFg
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Figma stamp · Tone: размер задаётся тоном.
 * `Primary` — главное действие, синий 148 с текстом; `Secondary` — вспомогательное, чёрный 48 с иконкой («Не нравится»).
 */
enum class StampTone(val size: Dp) { Primary(148.dp), Secondary(48.dp) }

/** Пик пружины bouncy — момент хаптики «stamp» (токены: ~120 мс после нажатия). */
private const val StampHapticDelayMs = 120L

/**
 * Штамп — фирменная 12-лучевая кнопка главного действия поверх коллажа. Одна на экран.
 * Переход «сделано» анимируется пружиной `stamp` (bouncy): 148 → 78 (×0.53), поворот −60°, чёрный, «отменить».
 *
 * **Контексты:** Образы на сегодня — «Надеть»; Стилист / С чем носить — «Сохранить» + малый чёрный штамп «Не нравится».
 *
 * @param label текст действия: «Надеть», «Сохранить». У `Secondary` не показывается (только иконка), но озвучивается.
 * @param icon иконка малого штампа (`Secondary`), по умолчанию `ThumbDown`.
 * @param done действие выполнено (флоу: Wear Action Active).
 */
@Composable
fun Stamp(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tone: StampTone = StampTone.Primary,
    icon: IconName = IconName.ThumbDown,
    done: Boolean = false,
) {
    val c = YeetTheme.colors
    val motion = YeetTheme.motion
    val haptics = YeetTheme.haptics
    val scope = rememberCoroutineScope()
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()

    val press by animateFloatAsState(if (pressed) YeetGesture.pressScaleStamp else 1f, motion.press(), label = "stampPress")
    val shapeScale by animateFloatAsState(if (done) 0.53f else 1f, motion.stamp(), label = "stampScale")
    val rotation by animateFloatAsState(if (done) -60f else 0f, motion.stamp(), label = "stampRotation")
    val labelScale by animateFloatAsState(if (done) 0.6f else 1f, motion.stamp(), label = "labelScale")
    val labelAlpha by animateFloatAsState(if (done) 0f else 1f, motion.fade(), label = "labelAlpha")
    val doneScale by animateFloatAsState(if (done) 1f else 0.6f, motion.stamp(), label = "doneScale")
    val shapeColor by animateColorAsState(
        if (done || tone == StampTone.Secondary) c.buttonSecondaryBg else c.buttonPrimaryBg, motion.fade(), label = "stampColor",
    )
    val labelColor = if (tone == StampTone.Secondary) c.buttonSecondaryFg else c.buttonPrimaryFg

    Box(
        modifier
            .size(tone.size)
            .semantics { contentDescription = if (done) "Отменить: $label" else label }
            .toggleable(
                value = done,
                interactionSource = interaction,
                indication = null,
                role = Role.Button,
                onValueChange = {
                    onClick()
                    when {
                        tone == StampTone.Secondary -> haptics.perform(YeetHapticEvent.Skip)
                        done -> haptics.perform(YeetHapticEvent.Toggle)
                        else -> scope.launch {
                            delay(StampHapticDelayMs)
                            haptics.perform(YeetHapticEvent.Stamp)
                        }
                    }
                },
            ),
        contentAlignment = Alignment.Center,
    ) {
        Box(Modifier.fillMaxSize().clearAndSetSemantics { }, contentAlignment = Alignment.Center) {
            Image(
                painter = rememberVectorPainter(YeetStampStarVector),
                contentDescription = null,
                colorFilter = ColorFilter.tint(shapeColor),
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        scaleX = shapeScale * press
                        scaleY = shapeScale * press
                        rotationZ = rotation
                    },
            )
            CompositionLocalProvider(LocalContentColor provides labelColor) {
                // Figma (флоу Outfits / Everyday): подпись наклонена на 15° по часовой
                Box(
                    Modifier.graphicsLayer {
                        alpha = labelAlpha
                        scaleX = labelScale
                        scaleY = labelScale
                        rotationZ = if (tone == StampTone.Primary) 15f else 0f
                    },
                ) {
                    if (tone == StampTone.Secondary) Icon(icon, size = 20.dp) else Text(label, maxLines = 1)
                }
            }
            Box(
                Modifier.graphicsLayer {
                    alpha = 1f - labelAlpha
                    scaleX = doneScale
                    scaleY = doneScale
                },
            ) {
                Icon(IconName.Undo, tint = c.buttonSecondaryFg)
            }
        }
    }
}

@YeetPreviews
@Composable
private fun StampPreview() = YeetPreviewSurface {
    var done by remember { mutableStateOf(false) }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
        Stamp(label = "Надеть", onClick = { done = !done }, done = done)
        Stamp(label = "Надеть", onClick = {}, done = true)
        Stamp(label = "Не нравится", onClick = {}, tone = StampTone.Secondary)
    }
}
